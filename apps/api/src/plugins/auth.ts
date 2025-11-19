import { PrismaClient } from '@prisma/client';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins';
import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

import { loadEnv } from '@/config/env.js';
import { RATE_LIMIT_CONFIG } from '@/config/rate-limit.js';

declare module 'fastify' {
  interface FastifyInstance {
    auth: ReturnType<typeof betterAuth>;
  }
}

const authPlugin: FastifyPluginAsync = async (app) => {
  const env = loadEnv();

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
      // CRITICAL: For cross-domain deployments (e.g., Vercel frontend + Railway API)
      // useSecureCookies forces secure cookies even in development
      useSecureCookies: env.NODE_ENV === 'production',
      // Generate request ID for tracing
      generateId: () =>
        `auth-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    },
    trustedOrigins: [env.FRONTEND_URL],
    // OAuth Social Providers (Optional)
    // To enable OAuth login, uncomment and configure the providers below
    // Make sure to set the corresponding environment variables (GITHUB_CLIENT_ID, etc.)
    // Example:
    // socialProviders: {
    //   github: {
    //     clientId: env.GITHUB_CLIENT_ID!,
    //     clientSecret: env.GITHUB_CLIENT_SECRET!,
    //   },
    //   google: {
    //     clientId: env.GOOGLE_CLIENT_ID!,
    //     clientSecret: env.GOOGLE_CLIENT_SECRET!,
    //   },
    // },
    socialProviders: {},
    plugins: [
      admin({
        defaultRole: 'user',
        adminRoles: ['admin', 'super_admin'],
      }),
    ],
  });

  app.decorate('auth', auth);

  // Register the catch-all route for Better Auth with stricter rate limiting
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
              // In production (cross-domain), modify cookie attributes
              let modifiedCookie = cookieValue;

              // Ensure Secure flag is present
              if (!modifiedCookie.includes('Secure')) {
                modifiedCookie += '; Secure';
              }

              // Replace SameSite=Lax with SameSite=None for cross-domain
              if (modifiedCookie.includes('SameSite=Lax')) {
                modifiedCookie = modifiedCookie.replace(
                  'SameSite=Lax',
                  'SameSite=None'
                );
              } else if (!modifiedCookie.includes('SameSite=')) {
                // If no SameSite is set, add it
                modifiedCookie += '; SameSite=None';
              }

              reply.header(key, modifiedCookie);
            } else {
              // In development (localhost), use default behavior
              reply.header(key, cookieValue);
            }
          } else {
            reply.header(key, value);
          }
        });

        // Send the response body
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

// Helper function to convert Fastify request to Web Request
async function toWebRequest(request: FastifyRequest): Promise<Request> {
  const url = new URL(request.url, `${request.protocol}://${request.hostname}`);

  // Build headers
  const headers = new Headers();
  Object.entries(request.headers).forEach(([key, value]) => {
    if (value) {
      const headerValue = Array.isArray(value)
        ? value.join(', ')
        : String(value);
      headers.set(key, headerValue);
    }
  });

  // Get request body for non-GET/HEAD requests
  let body: string | null = null;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    // Better Auth expects raw body, so we read it from raw property or stringify
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
