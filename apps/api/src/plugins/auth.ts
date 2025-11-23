import { type PrismaClient } from '@prisma/client';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { createAuthMiddleware } from 'better-auth/api';
import { admin } from 'better-auth/plugins';
import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

import { loadEnv } from '@/config/env.js';
import { RATE_LIMIT_CONFIG } from '@/config/rate-limit.js';
import { logAudit } from '@/utils/audit-logger.js';

declare module 'fastify' {
  interface FastifyInstance {
    auth: ReturnType<typeof betterAuth>;
  }
}

const authPlugin: FastifyPluginAsync = async (app) => {
  const env = loadEnv();

  const socialProviders: Record<string, unknown> = {};

  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    socialProviders.google = {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    };
  }

  if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
    socialProviders.github = {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    };
  }

  app.log.info({
    providers: Object.keys(socialProviders),
    message: 'OAuth providers configured',
  });

  const auth = betterAuth({
    database: prismaAdapter(app.prisma as unknown as PrismaClient, {
      provider: 'postgresql',
    }),
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      sendEmailVerificationOnSignUp: true,
      autoSignInAfterVerification: true,
      resetPasswordTokenExpiresIn: 3600,
      sendResetPassword: async ({ user, token }) => {
        const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;
        await app.emailService.sendPasswordResetEmail(user.email, resetUrl);
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        const urlObj = new URL(url);
        urlObj.searchParams.set('callbackURL', env.FRONTEND_URL);
        await app.emailService.sendVerificationEmail(
          user.email,
          urlObj.toString()
        );
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // Update every 24 hours
      cookieCache: {
        enabled: true,
        maxAge: 60 * 60 * 24 * 30, // 30 days
      },
    },
    advanced: {
      // IMPORTANT: For cross-domain deployments
      // useSecureCookies forces secure cookies even in development
      useSecureCookies: env.NODE_ENV === 'production',
      database: {
        generateId: () =>
          `auth-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      },
      redirectURLs: {
        onError: env.FRONTEND_URL,
        afterSignIn: env.FRONTEND_URL,
      },
    },
    trustedOrigins: [env.FRONTEND_URL],
    socialProviders,
    plugins: [
      admin({
        defaultRole: 'user',
        adminRoles: ['admin', 'super_admin'],
      }),
    ],
    hooks: {
      after: createAuthMiddleware(async (ctx) => {
        try {
          const newSession = ctx.context.newSession;
          const headers = ctx.headers;
          const ipAddress = headers
            ? (headers.get('x-forwarded-for')?.split(',')[0] ?? null) ||
              (headers.get('x-real-ip') ?? null)
            : null;
          const userAgent = headers
            ? (headers.get('user-agent') ?? null)
            : null;

          if (ctx.path === '/sign-in/email' && newSession) {
            await logAudit(app.auditService, {
              userId: newSession.user.id,
              action: 'user.login',
              resourceType: 'user',
              resourceId: newSession.user.id,
              ipAddress,
              userAgent,
            });
          }

          if (ctx.path.startsWith('/sign-up') && newSession) {
            await logAudit(app.auditService, {
              userId: newSession.user.id,
              action: 'user.created',
              resourceType: 'user',
              resourceId: newSession.user.id,
              ipAddress,
              userAgent,
            });
          }

          if (ctx.path === '/verify-email') {
            const returned = ctx.context.returned as
              | { user?: { id: string } }
              | undefined;
            if (returned?.user) {
              await logAudit(app.auditService, {
                userId: returned.user.id,
                action: 'email.verified',
                resourceType: 'email',
                resourceId: returned.user.id,
                ipAddress,
                userAgent,
              });
            }
          }

          if (ctx.path === '/link-social') {
            const returned = ctx.context.returned as
              | {
                  user?: { id: string };
                  account?: { id: string; providerId: string };
                }
              | undefined;
            if (returned?.user && returned?.account) {
              await logAudit(app.auditService, {
                userId: returned.user.id,
                action: 'account.linked',
                resourceType: 'account',
                resourceId: returned.account.id,
                changes: { providerId: returned.account.providerId },
                ipAddress,
                userAgent,
              });
            }
          }

          if (ctx.path === '/sign-out') {
            const session = ctx.context.session as
              | { user: { id: string } }
              | undefined;
            const userId = session?.user?.id;
            if (userId) {
              await logAudit(app.auditService, {
                userId,
                action: 'user.logout',
                resourceType: 'user',
                resourceId: userId,
                ipAddress,
                userAgent,
              });
            }
          }
        } catch (error) {
          app.log.error(error, 'Failed to log audit event in after hook');
        }
      }),
    },
  });

  app.decorate('auth', auth);

  app.all(
    '/api/auth/*',
    {
      config: {
        rateLimit: {
          max: RATE_LIMIT_CONFIG.routes.auth.max,
          timeWindow: RATE_LIMIT_CONFIG.routes.auth.timeWindow,
        },
      },
    },
    async (request, reply) => {
      try {
        // Convert Fastify request to Web Request for Better Auth
        const webRequest = await toWebRequest(request);

        // Handle the request with Better Auth
        const response = await auth.handler(webRequest);

        // Set status
        reply.status(response.status);

        // Process headers and modify Set-Cookie for cross-domain
        response.headers.forEach((value, key) => {
          if (key.toLowerCase() === 'set-cookie') {
            // For cross-domain cookie support, we need to modify cookie attributes
            // Better Auth sets cookies, but we need to ensure SameSite=None for cross-domain
            const cookieValue = value;

            if (env.NODE_ENV === 'production') {
              let modifiedCookie = cookieValue;

              if (!modifiedCookie.includes('Secure')) {
                modifiedCookie += '; Secure';
              }

              if (modifiedCookie.includes('SameSite=Lax')) {
                modifiedCookie = modifiedCookie.replace(
                  'SameSite=Lax',
                  'SameSite=None'
                );
              } else if (!modifiedCookie.includes('SameSite=')) {
                modifiedCookie += '; SameSite=None';
              }

              reply.header(key, modifiedCookie);
            } else {
              reply.header(key, cookieValue);
            }
          } else {
            reply.header(key, value);
          }
        });

        const body = await response.text();
        return reply.send(body);
      } catch (error) {
        app.log.error(error, 'Better Auth handler error');
        return reply.status(500).send({
          statusCode: 500,
          error: 'Internal Server Error',
          message: 'Authentication error occurred',
        });
      }
    }
  );

  app.log.info('✅ Better Auth configured');
};

async function toWebRequest(request: FastifyRequest): Promise<Request> {
  const url = new URL(request.url, `${request.protocol}://${request.hostname}`);

  const headers = new Headers();
  Object.entries(request.headers).forEach(([key, value]) => {
    if (value) {
      const headerValue = Array.isArray(value)
        ? value.join(', ')
        : String(value);
      headers.set(key, headerValue);
    }
  });

  let body: string | null = null;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    if (request.body) {
      body = JSON.stringify(request.body);
    }
  }

  return new Request(url.toString(), {
    method: request.method,
    headers,
    body,
  });
}

export default fp(authPlugin);
