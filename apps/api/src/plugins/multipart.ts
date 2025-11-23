import multipart from '@fastify/multipart';
import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { MAX_FILE_SIZE } from '@/utils/file-validation';

const multipartPlugin: FastifyPluginAsync = async (app) => {
  await app.register(multipart, {
    limits: {
      fileSize: MAX_FILE_SIZE,
      files: 1, // Allow 1 file per request (can be increased)
    },
  });
};

export default fp(multipartPlugin);
