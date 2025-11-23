import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { LoggerService } from '@/common/logger.service';
import { loadEnv } from '@/config/env';

const env = loadEnv();

declare module 'fastify' {
  interface FastifyInstance {
    logger: LoggerService;
  }
  interface FastifyRequest {
    logger: LoggerService;
  }
}

const loggerPlugin: FastifyPluginAsync = async (app) => {
  const logger = new LoggerService(app.log);
  logger.setContext('FastifyApp');

  app.decorate('logger', logger);

  app.addHook('onRequest', async (request) => {
    request.logger = new LoggerService(request.log);
  });

  app.log.info(
    `[+] Logger service configured with verbosity: ${env.LOG_LEVEL}`
  );
};

export default fp(loggerPlugin);
