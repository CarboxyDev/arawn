import { PrismaClient } from '@prisma/client';
import { type FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { loadEnv } from '@/config/env';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

const databasePlugin: FastifyPluginAsync = async (app) => {
  const env = loadEnv();
  const prisma = new PrismaClient({
    log:
      env.LOG_LEVEL === 'verbose'
        ? ['query', 'info', 'warn', 'error']
        : ['warn', 'error'],
  });

  await prisma.$connect();
  app.log.info('[+] Database connected successfully');

  app.decorate('prisma', prisma);

  app.addHook('onClose', async (instance) => {
    instance.log.info('[-] Disconnecting from database...');
    await instance.prisma.$disconnect();
  });
};

export default fp(databasePlugin);
