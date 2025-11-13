import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { LoggerService } from '@/common/logger.service';

declare module 'fastify' {
  interface FastifyInstance {
    logger: LoggerService;
  }
  interface FastifyRequest {
    logger: LoggerService;
  }
}

const loggerPlugin: FastifyPluginAsync = async (app) => {
  const logger = new LoggerService();
  logger.setContext('FastifyApp');

  app.decorate('logger', logger);

  app.addHook('onRequest', async (request) => {
    request.logger = logger.child('Request');
  });

  app.log.info('✅ Logger service configured');
};

export default fp(loggerPlugin);
