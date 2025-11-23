import path from 'node:path';

import fastifyStatic from '@fastify/static';
import type { FastifyPluginAsync } from 'fastify';

const uploadsServeRoutes: FastifyPluginAsync = async (app) => {
  const storageType = app.fileStorageService.getStorageType();

  // Only serve local files if using local storage
  if (storageType === 'local') {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

    await app.register(fastifyStatic, {
      root: uploadsDir,
      prefix: '/uploads/files/',
      decorateReply: false,
    });

    app.log.info('[+] Local file serving configured at /uploads/files/');
  } else {
    app.log.info(
      `[+] Using ${storageType} storage - local file serving disabled`
    );
  }
};

export default uploadsServeRoutes;
