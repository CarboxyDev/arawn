import { message, ValidationError } from '@repo/packages-utils';
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

import { requireAuth } from '@/hooks/auth';
import { logAudit } from '@/utils/audit-logger';

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
    async (request) => {
      const { currentPassword, newPassword } = request.body;

      if (currentPassword === newPassword) {
        throw new ValidationError(
          'New password must be different from current password'
        );
      }

      await app.passwordService.changePassword(
        request.user!.id,
        currentPassword,
        newPassword
      );

      await logAudit(app.auditService, {
        userId: request.user!.id,
        action: 'password.changed',
        resourceType: 'password',
        resourceId: request.user!.id,
        request,
      });

      return message(
        'Password changed successfully. All other sessions have been revoked.'
      );
    }
  );
};

export default passwordRoutes;
