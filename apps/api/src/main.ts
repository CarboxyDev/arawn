import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import formbody from '@fastify/formbody';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import closeWithGrace from 'close-with-grace';
import Fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod';

import { loadEnv } from '@/config/env.js';

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

await app.register(rateLimit, {
  max: 30,
  timeWindow: 60 * 1000,
  errorResponseBuilder: () => ({
    statusCode: 429,
    error: 'Too Many Requests',
    message: 'Rate limit exceeded. Please try again later.',
  }),
});

await app.register(cookie, {
  secret: process.env.COOKIE_SECRET || 'dev-secret-change-in-production',
  parseOptions: {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
  },
});

await app.register(formbody);

const { default: databasePlugin } = await import('@/plugins/database.js');
await app.register(databasePlugin);

const { default: authPlugin } = await import('@/plugins/auth.js');
await app.register(authPlugin);

app.setErrorHandler((error, request, reply) => {
  const err = error as any;
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An error occurred';
  const validation = err.validation;

  request.log.error(
    {
      err: error,
      reqId: request.id,
      url: request.url,
      method: request.method,
    },
    'Request error'
  );

  if (validation) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Validation Error',
      message: 'Request validation failed',
      issues: validation,
    });
  }

  const isProduction = env.NODE_ENV === 'production';
  return reply.status(statusCode).send({
    statusCode,
    error: err.name || 'Internal Server Error',
    message: isProduction && statusCode === 500 ? 'An error occurred' : message,
  });
});

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
  const { default: exampleRoutes } = await import('@/routes/example.js');
  const { default: usersRoutes } = await import('@/routes/users.js');

  await app.register(exampleRoutes);
  await app.register(usersRoutes);
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
