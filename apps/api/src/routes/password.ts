import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

import { requireAuth } from '@/hooks/auth';

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(8, 'Password must be at least 8 characters'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

const passwordRoutes: FastifyPluginAsync = async (app) => {
  app.post<{
    Body: z.infer<typeof ChangePasswordSchema>;
  }>(
    '/password/change',
    {
      preHandler: requireAuth,
      schema: {
        body: ChangePasswordSchema,
      },
    },
    async (request, reply) => {
      const { currentPassword, newPassword } = request.body;

      if (currentPassword === newPassword) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'New password must be different from current password',
        });
      }

      try {
        await app.passwordService.changePassword(
          request.user!.id,
          currentPassword,
          newPassword
        );

        return {
          message:
            'Password changed successfully. All other sessions have been revoked.',
        };
      } catch (error) {
        if (
          error instanceof Error &&
          (error.message === 'Current password is incorrect' ||
            error.message === 'Password authentication not available')
        ) {
          return reply.status(400).send({
            statusCode: 400,
            error: 'Bad Request',
            message: error.message,
          });
        }
        throw error;
      }
    }
  );
};

export default passwordRoutes;
