import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import formbody from '@fastify/formbody';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { AppError } from '@repo/packages-utils';
import closeWithGrace from 'close-with-grace';
import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import Fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod';

import { loadEnv } from '@/config/env.js';
import type { RateLimitRole } from '@/config/rate-limit.js';
import { RATE_LIMIT_CONFIG } from '@/config/rate-limit.js';

const env = loadEnv();

const app = Fastify({
  logger: {
    level: env.LOG_LEVEL === 'minimal' ? 'error' : 'info',
    transport:
      env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              ignore: 'pid,hostname',
              translateTime: 'HH:MM:ss',
            },
          }
        : undefined,
  },
  requestIdLogLabel: 'reqId',
  disableRequestLogging: false,
  requestIdHeader: 'x-request-id',
  genReqId: () => `req-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  bodyLimit: 1048576,
  routerOptions: {
    ignoreTrailingSlash: true,
  },
  onProtoPoisoning: 'error',
  onConstructorPoisoning: 'error',
}).withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

await app.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
});

await app.register(cors, {
  origin: env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID'],
});

// @ts-expect-error - Known issue with @fastify/rate-limit type definitions
await app.register(rateLimit, {
  global: true,
  max: async (request: FastifyRequest) => {
    const session = await request.server.auth.api
      .getSession({
        headers: request.headers as unknown as Headers,
      })
      .catch(() => null);

    if (!session?.user) {
      return RATE_LIMIT_CONFIG.anonymous.max;
    }

    const userWithRole = session.user as typeof session.user & {
      role?: string;
    };
    const role = (userWithRole.role || 'user') as RateLimitRole;

    return RATE_LIMIT_CONFIG[role]?.max || RATE_LIMIT_CONFIG.user.max;
  },
  timeWindow: 60 * 1000,
  keyGenerator: async (request: FastifyRequest) => {
    const session = await request.server.auth.api
      .getSession({
        headers: request.headers as unknown as Headers,
      })
      .catch(() => null);

    if (session?.user?.id) {
      return `user:${session.user.id}`;
    }

    return `ip:${request.ip}`;
  },
  addHeadersOnExceeding: {
    'X-RateLimit-Limit': true,
    'X-RateLimit-Remaining': true,
    'X-RateLimit-Reset': true,
  },
  addHeaders: {
    'X-RateLimit-Limit': true,
    'X-RateLimit-Remaining': true,
    'X-RateLimit-Reset': true,
  },
  errorResponseBuilder: (request: FastifyRequest) => ({
    statusCode: 429,
    error: 'Too Many Requests',
    message: 'Rate limit exceeded. Please try again later.',
  }),
});

await app.register(cookie, {
  secret: env.COOKIE_SECRET,
  parseOptions: {},
});

await app.register(formbody);

const { default: multipartPlugin } = await import('@/plugins/multipart.js');
await app.register(multipartPlugin);

const { default: loggerPlugin } = await import('@/plugins/logger.js');
await app.register(loggerPlugin);

const { default: databasePlugin } = await import('@/plugins/database.js');
await app.register(databasePlugin);

const { default: servicesPlugin } = await import('@/plugins/services.js');
await app.register(servicesPlugin);

const { default: authPlugin } = await import('@/plugins/auth.js');
await app.register(authPlugin);

const { default: swaggerPlugin } = await import('@/plugins/swagger.js');
await app.register(swaggerPlugin);

const { default: scalarPlugin } = await import('@/plugins/scalar.js');
await app.register(scalarPlugin);

const { default: schedulePlugin } = await import('@/plugins/schedule.js');
await app.register(schedulePlugin);

const errorHandler = async (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  request.log.error(
    {
      err: error,
      reqId: request.id,
      url: request.url,
      method: request.method,
    },
    'Request error'
  );

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: {
        message: error.message,
        code: error.code,
        ...(error.details && { details: error.details }),
      },
    });
  }

  if (error.validation) {
    return reply.status(400).send({
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.validation,
      },
    });
  }

  const isProduction = env.NODE_ENV === 'production';
  const statusCode = error.statusCode || 500;

  return reply.status(statusCode).send({
    error: {
      message:
        isProduction && statusCode === 500
          ? 'Internal server error'
          : error.message || 'An error occurred',
      code: 'INTERNAL_ERROR',
    },
  });
};

app.setErrorHandler(errorHandler);

app.addHook('onRequest', async (request) => {
  request.log = request.log.child({ reqId: request.id });
});

app.addHook('onResponse', async (request, reply) => {
  const responseTime = reply.elapsedTime;

  if (env.LOG_LEVEL === 'minimal' && reply.statusCode < 400) {
    return;
  }

  request.log.info(
    {
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      responseTime: `${responseTime.toFixed(2)}ms`,
    },
    'Request completed'
  );
});

app.get('/health', async (request, reply) => {
  try {
    await app.prisma.$queryRaw`SELECT 1`;
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
    };
  } catch (error) {
    request.log.error(error, 'Database health check failed');
    return reply.status(503).send({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
    });
  }
});

const registerRoutes = async () => {
  const { default: usersRoutes } = await import('@/routes/users.js');
  const { default: sessionsRoutes } = await import('@/routes/sessions.js');
  const { default: passwordRoutes } = await import('@/routes/password.js');
  const { default: verificationRoutes } = await import(
    '@/routes/verification.js'
  );
  const { default: uploadsRoutes } = await import('@/routes/uploads.js');
  const { default: uploadsServeRoutes } = await import(
    '@/routes/uploads-serve.js'
  );

  // Register file serving (conditional on storage type)
  await app.register(uploadsServeRoutes);

  await app.register(
    async (app) => {
      await app.register(usersRoutes);
      await app.register(sessionsRoutes);
      await app.register(passwordRoutes);
      await app.register(verificationRoutes);
      await app.register(uploadsRoutes);
    },
    { prefix: '/api' }
  );
};

const start = async () => {
  await registerRoutes();

  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    app.log.info(`🚀 API server ready at ${env.API_URL}`);
    app.log.info(`📝 Environment: ${env.NODE_ENV}`);
    app.log.info(`🔒 CORS enabled for: ${env.FRONTEND_URL}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

const closeListeners = closeWithGrace(
  { delay: Number(process.env.FASTIFY_CLOSE_GRACE_DELAY) || 500 },
  async ({ err }) => {
    if (err) {
      app.log.error(err);
    }
    await app.close();
  }
);

app.addHook('onClose', async () => {
  closeListeners.uninstall();
});

start();
