import { message, success } from '@repo/packages-utils';
import type { FastifyPluginAsync } from 'fastify';

import { requireAuth } from '@/hooks/auth';
import { logAudit } from '@/utils/audit-logger';

const sessionsRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    '/sessions',
    {
      preHandler: requireAuth,
    },
    async (request) => {
      const sessions = await app.sessionsService.getUserSessions(
        request.user!.id
      );
      return success(sessions);
    }
  );

  app.delete<{
    Params: { sessionId: string };
  }>(
    '/sessions/:sessionId',
    {
      preHandler: requireAuth,
    },
    async (request) => {
      await app.sessionsService.revokeSession(
        request.user!.id,
        request.params.sessionId
      );

      await logAudit(app.auditService, {
        userId: request.user!.id,
        action: 'session.revoked',
        resourceType: 'session',
        resourceId: request.params.sessionId,
        request,
      });

      return message('Session revoked successfully');
    }
  );

  app.delete(
    '/sessions',
    {
      preHandler: requireAuth,
    },
    async (request) => {
      const currentSessionId = request.user?.session?.id;
      await app.sessionsService.revokeAllSessions(
        request.user!.id,
        currentSessionId
      );

      await logAudit(app.auditService, {
        userId: request.user!.id,
        action: 'session.revoked_all',
        resourceType: 'session',
        request,
      });

      return message('All other sessions revoked successfully');
    }
  );
};

export default sessionsRoutes;
