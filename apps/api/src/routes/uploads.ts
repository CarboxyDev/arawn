import type { MultipartFile } from '@fastify/multipart';
import {
  DeleteUploadParamsSchema,
  GetUploadsQuerySchema,
  UploadResponseSchema,
  UploadStatsSchema,
} from '@repo/packages-types/upload';
import {
  UnauthorizedError,
  ValidationError,
} from '@repo/packages-utils/errors';
import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { RATE_LIMIT_CONFIG } from '@/config/rate-limit.js';
import { requireAuth } from '@/hooks/auth';

const uploadsRoutes: FastifyPluginAsync = async (app) => {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // POST /api/uploads - Upload a file
  server.post(
    '/uploads',
    {
      onRequest: requireAuth,
      config: {
        rateLimit: {
          max: RATE_LIMIT_CONFIG.routes.uploads.max,
          timeWindow: RATE_LIMIT_CONFIG.routes.uploads.timeWindow,
        },
      },
      schema: {
        description: 'Upload a file',
        tags: ['Uploads'],
        response: {
          201: UploadResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const userId = request.user?.id;

      if (!userId) {
        throw new UnauthorizedError();
      }

      const data = await request.file();

      if (!data) {
        throw new ValidationError('No file provided');
      }

      const file = data as MultipartFile;

      const upload = await app.uploadsService.uploadFile(file, userId);

      return reply.status(201).send(upload);
    }
  );

  // GET /api/uploads - Get user's uploads
  server.get(
    '/uploads',
    {
      onRequest: requireAuth,
      schema: {
        querystring: GetUploadsQuerySchema,
        description: 'Get paginated list of user uploads',
        tags: ['Uploads'],
        response: {
          200: z.array(
            UploadResponseSchema.omit({ user: true }).extend({
              userId: z.string(),
            })
          ),
        },
      },
    },
    async (request) => {
      const userId = request.user?.id;

      if (!userId) {
        throw new UnauthorizedError();
      }

      const { limit, offset } = request.query;

      const uploads = await app.uploadsService.getUserUploads(userId, {
        limit,
        offset,
      });

      return uploads;
    }
  );

  // GET /api/uploads/stats - Get upload statistics
  server.get(
    '/uploads/stats',
    {
      onRequest: requireAuth,
      schema: {
        description: 'Get upload statistics for current user',
        tags: ['Uploads'],
        response: {
          200: UploadStatsSchema,
        },
      },
    },
    async (request) => {
      const userId = request.user?.id;

      if (!userId) {
        throw new UnauthorizedError();
      }

      const stats = await app.uploadsService.getUploadStats(userId);

      return stats;
    }
  );

  // DELETE /api/uploads/:id - Delete an upload
  server.delete(
    '/uploads/:id',
    {
      onRequest: requireAuth,
      schema: {
        params: DeleteUploadParamsSchema,
        description: 'Delete an upload',
        tags: ['Uploads'],
        response: {
          204: z.void(),
        },
      },
    },
    async (request, reply) => {
      const userId = request.user?.id;

      if (!userId) {
        throw new UnauthorizedError();
      }

      const { id } = request.params;

      await app.uploadsService.deleteUpload(id, userId);

      return reply.status(204).send();
    }
  );
};

export default uploadsRoutes;
