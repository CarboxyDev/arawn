import { QueryAuditLogsSchema } from '@repo/packages-types';
import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';

import { requireAuth, requireRole } from '@/hooks/auth';

const auditRoutes: FastifyPluginAsync = async (app) => {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // GET /audit - Get paginated audit logs with filtering (Admin only)
  server.get(
    '/audit',
    {
      preHandler: [requireAuth, requireRole(['admin', 'super_admin'])],
      schema: {
        querystring: QueryAuditLogsSchema,
        description:
          'Get paginated audit logs with filtering and sorting (Admin only)',
        tags: ['Audit'],
      },
    },
    async (request) => {
      return app.auditService.getAuditLogs(request.query);
    }
  );

  // GET /audit/stats - Get audit log statistics (Admin only)
  server.get(
    '/audit/stats',
    {
      preHandler: [requireAuth, requireRole(['admin', 'super_admin'])],
      schema: {
        description: 'Get audit log statistics (Admin only)',
        tags: ['Audit'],
      },
    },
    async () => {
      return app.auditService.getAuditLogStats();
    }
  );
};

export default auditRoutes;
