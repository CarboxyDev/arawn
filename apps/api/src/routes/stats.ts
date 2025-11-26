import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';

import { requireAuth, requireRole } from '@/hooks/auth';

const statsRoutes: FastifyPluginAsync = async (app) => {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.get(
    '/admin/stats',
    {
      preHandler: [requireAuth, requireRole(['admin', 'super_admin'])],
      schema: {
        description: 'Get comprehensive system statistics (Admin only)',
        tags: ['Admin'],
      },
    },
    async () => {
      return app.statsService.getSystemStats();
    }
  );

  server.get(
    '/admin/stats/health',
    {
      preHandler: [requireAuth, requireRole(['admin', 'super_admin'])],
      schema: {
        description: 'Get system health check with DB latency (Admin only)',
        tags: ['Admin'],
      },
    },
    async () => {
      return app.statsService.getHealthCheck();
    }
  );
};

export default statsRoutes;
