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
        title: 'API',
        description:
          'Production-ready TypeScript API built with Fastify. Includes authentication, user management, file uploads, and admin capabilities.',
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
            description:
              'Session cookie automatically set by Better Auth after successful authentication. Used for all authenticated endpoints.',
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
          description:
            'Authentication endpoints powered by Better Auth. ' +
            'Available at /api/auth/*: ' +
            'sign-in/email (POST - login), ' +
            'sign-up/email (POST - register), ' +
            'sign-out (POST - logout), ' +
            'session (GET - current session), ' +
            'forget-password (POST - request reset), ' +
            'reset-password (POST - reset with token), ' +
            'verify-email (GET - verify email), ' +
            'sign-in/social (GET - OAuth login), ' +
            'callback/:provider (GET - OAuth callback). ' +
            'All endpoints manage session cookies automatically.',
        },
        { name: 'Sessions', description: 'Session management endpoints' },
        { name: 'Password', description: 'Password management endpoints' },
        {
          name: 'Verification',
          description: 'Email verification endpoints',
        },
        {
          name: 'Uploads',
          description: 'File upload and management endpoints',
        },
        {
          name: 'Accounts',
          description: 'OAuth account management endpoints',
        },
        {
          name: 'Admin',
          description: 'Admin-only system management endpoints',
        },
        {
          name: 'Metrics',
          description: 'System metrics and monitoring endpoints',
        },
      ],
    },
    transform: jsonSchemaTransform,
  });
};

export default fp(swaggerPlugin);
