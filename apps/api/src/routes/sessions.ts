import type { FastifyPluginAsync } from 'fastify';

import { requireAuth } from '@/hooks/auth';

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
      return { data: sessions };
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

      return { message: 'Session revoked successfully' };
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

      return { message: 'All other sessions revoked successfully' };
    }
  );
};

export default sessionsRoutes;
