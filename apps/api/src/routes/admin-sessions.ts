import {
  QuerySessionsSchema,
  RevokeSessionParamsSchema,
  RevokeUserSessionsParamsSchema,
} from '@repo/packages-types/session';
import { message } from '@repo/packages-utils/response';
import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import type { z } from 'zod';

import { requireAuth, requireRole } from '@/hooks/auth';

type RevokeSessionParams = z.infer<typeof RevokeSessionParamsSchema>;
type RevokeUserSessionsParams = z.infer<typeof RevokeUserSessionsParamsSchema>;

const adminSessionsRoutes: FastifyPluginAsync = async (app) => {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.get(
    '/admin/sessions',
    {
      preHandler: [requireAuth, requireRole(['admin', 'super_admin'])],
      schema: {
        querystring: QuerySessionsSchema,
        description: 'Get paginated sessions with filtering (Admin only)',
        tags: ['Admin'],
      },
    },
    async (request) => {
      return app.sessionsService.getAdminSessions(request.query);
    }
  );

  server.get(
    '/admin/sessions/stats',
    {
      preHandler: [requireAuth, requireRole(['admin', 'super_admin'])],
      schema: {
        description: 'Get session statistics (Admin only)',
        tags: ['Admin'],
      },
    },
    async () => {
      return app.sessionsService.getSessionStats();
    }
  );

  server.delete<{ Params: RevokeSessionParams }>(
    '/admin/sessions/:sessionId',
    {
      preHandler: [requireAuth, requireRole(['admin', 'super_admin'])],
      schema: {
        params: RevokeSessionParamsSchema,
        description: 'Force revoke a session (Admin only)',
        tags: ['Admin'],
      },
    },
    async (request) => {
      const { sessionId } = request.params;
      await app.sessionsService.adminRevokeSession(
        request.user!.id,
        request.user!.role as 'user' | 'admin' | 'super_admin',
        sessionId
      );

      return message('Session revoked successfully');
    }
  );

  server.delete<{ Params: RevokeUserSessionsParams }>(
    '/admin/sessions/user/:userId',
    {
      preHandler: [requireAuth, requireRole(['admin', 'super_admin'])],
      schema: {
        params: RevokeUserSessionsParamsSchema,
        description: 'Revoke all sessions for a user (Admin only)',
        tags: ['Admin'],
      },
    },
    async (request) => {
      const { userId } = request.params;
      const count = await app.sessionsService.adminRevokeUserSessions(
        request.user!.id,
        request.user!.role as 'user' | 'admin' | 'super_admin',
        userId
      );

      return message(`Revoked ${count} session(s) for user`);
    }
  );
};

export default adminSessionsRoutes;
