import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { requireAuth } from '@/hooks/auth';

const accountsRoutes: FastifyPluginAsync = async (app) => {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.get(
    '/accounts',
    {
      schema: {
        description: 'Get all connected accounts for the authenticated user',
        tags: ['Accounts'],
        response: {
          200: z.object({
            userId: z.string(),
            hasPassword: z.boolean(),
            connectedAccounts: z.array(
              z.object({
                providerId: z.string(),
                accountId: z.string(),
                connectedAt: z.date(),
                scope: z.string().optional(),
              })
            ),
          }),
        },
      },
      preHandler: requireAuth,
    },
    async (request) => {
      const userId = request.user!.id;
      return app.accountsService.getUserAccounts(userId);
    }
  );

  server.delete(
    '/accounts/:providerId',
    {
      schema: {
        description: 'Unlink an OAuth provider from the user account',
        tags: ['Accounts'],
        params: z.object({
          providerId: z.enum(['google', 'github']),
        }),
        response: {
          200: z.object({
            success: z.boolean(),
          }),
        },
      },
      preHandler: requireAuth,
    },
    async (request) => {
      const userId = request.user!.id;
      const { providerId } = request.params;
      const result = await app.accountsService.unlinkAccount(
        userId,
        providerId
      );

      return result;
    }
  );

  server.get(
    '/accounts/can-change-password',
    {
      schema: {
        description:
          'Check if user can change password (has password set via credential provider)',
        tags: ['Accounts'],
        response: {
          200: z.object({
            canChangePassword: z.boolean(),
          }),
        },
      },
      preHandler: requireAuth,
    },
    async (request) => {
      const userId = request.user!.id;
      const canChange = await app.accountsService.canChangePassword(userId);
      return { canChangePassword: canChange };
    }
  );
};

export default accountsRoutes;
