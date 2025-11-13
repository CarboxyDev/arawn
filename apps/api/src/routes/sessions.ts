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

      return {
        data: sessions,
      };
    }
  );

  app.delete<{
    Params: { sessionId: string };
  }>(
    '/sessions/:sessionId',
    {
      preHandler: requireAuth,
    },
    async (request, reply) => {
      try {
        await app.sessionsService.revokeSession(
          request.user!.id,
          request.params.sessionId
        );

        return {
          message: 'Session revoked successfully',
        };
      } catch (error) {
        if (error instanceof Error && error.message === 'Session not found') {
          return reply.status(404).send({
            statusCode: 404,
            error: 'Not Found',
            message: 'Session not found',
          });
        }
        throw error;
      }
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

      return {
        message: 'All other sessions revoked successfully',
      };
    }
  );
};

export default sessionsRoutes;
