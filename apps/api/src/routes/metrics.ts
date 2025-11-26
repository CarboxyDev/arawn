import type { FastifyPluginAsync } from 'fastify';

import { requireAuth, requireRole } from '@/hooks/auth';
import { metricsService } from '@/services/metrics.service';

const metricsRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    '/admin/metrics/stream',
    {
      preHandler: [requireAuth, requireRole(['admin', 'super_admin'])],
      schema: {
        description: 'Stream real-time system metrics via SSE (Admin only)',
        tags: ['Admin'],
      },
    },
    async (request, reply) => {
      reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': app.env.FRONTEND_URL,
        'Access-Control-Allow-Credentials': 'true',
      });

      const history = metricsService.getHistory();
      if (history.length > 0) {
        reply.raw.write(`event: history\n`);
        reply.raw.write(`data: ${JSON.stringify(history)}\n\n`);
      }

      const unsubscribe = metricsService.subscribe((metrics) => {
        if (!reply.raw.destroyed) {
          reply.raw.write(`event: metrics\n`);
          reply.raw.write(`data: ${JSON.stringify(metrics)}\n\n`);
        }
      });

      const heartbeatInterval = setInterval(() => {
        if (!reply.raw.destroyed) {
          reply.raw.write(`:heartbeat\n\n`);
        }
      }, 15000);

      request.raw.on('close', () => {
        unsubscribe();
        clearInterval(heartbeatInterval);
      });

      return reply;
    }
  );

  app.get(
    '/admin/metrics/snapshot',
    {
      preHandler: [requireAuth, requireRole(['admin', 'super_admin'])],
      schema: {
        description: 'Get current metrics snapshot (Admin only)',
        tags: ['Admin'],
      },
    },
    async () => {
      return {
        current: metricsService.getLatest(),
        history: metricsService.getHistory(),
      };
    }
  );
};

export default metricsRoutes;
