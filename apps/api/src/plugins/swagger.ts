import swagger from '@fastify/swagger';
import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import {
  jsonSchemaTransform,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';

import { loadEnv } from '@/config/env';

const swaggerPlugin: FastifyPluginAsync = async (app) => {
  const env = loadEnv();

  await app.withTypeProvider<ZodTypeProvider>().register(swagger, {
    openapi: {
      info: {
        title: 'Arawn API',
        description: 'Production-ready TypeScript API built with Fastify',
        version: '1.0.0',
      },
      servers: [
        {
          url: env.API_URL,
          description: `${env.NODE_ENV.charAt(0).toUpperCase() + env.NODE_ENV.slice(1)} server`,
        },
      ],
      components: {
        securitySchemes: {
          cookieAuth: {
            type: 'apiKey',
            in: 'cookie',
            name: 'better-auth.session_token',
          },
        },
      },
      security: [
        {
          cookieAuth: [],
        },
      ],
      tags: [
        { name: 'Health', description: 'Health check endpoints' },
        { name: 'Users', description: 'User management endpoints' },
        {
          name: 'Auth',
          description: 'Authentication endpoints (handled by Better Auth)',
        },
        { name: 'Sessions', description: 'Session management endpoints' },
        { name: 'Password', description: 'Password management endpoints' },
      ],
    },
    transform: jsonSchemaTransform,
  });
};

export default fp(swaggerPlugin);
