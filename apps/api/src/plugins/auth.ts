import { PrismaClient } from '@prisma/client';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins';
import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyInstance {
    auth: ReturnType<typeof betterAuth>;
  }
}

const authPlugin: FastifyPluginAsync = async (app) => {
  const auth = betterAuth({
    database: prismaAdapter(app.prisma as unknown as PrismaClient, {
      provider: 'postgresql',
    }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // Update every 24 hours
      cookieCache: {
        enabled: true,
        maxAge: 60 * 60 * 24 * 30, // 30 days
      },
    },
    trustedOrigins: [process.env.FRONTEND_URL || 'http://localhost:3000'],
    socialProviders: {},
    plugins: [
      admin({
        defaultRole: 'user',
        adminRoles: ['admin', 'super_admin'],
      }),
    ],
  });

  app.decorate('auth', auth);

  // Register the catch-all route for Better Auth
  app.all('/api/auth/*', async (request, reply) => {
    try {
      // Convert Fastify request to Web Request for Better Auth
      const webRequest = await toWebRequest(request);

      // Handle the request with Better Auth
      const response = await auth.handler(webRequest);

      // Set status and headers
      reply.status(response.status);
      response.headers.forEach((value, key) => {
        reply.header(key, value);
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
  });

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
