import 'dotenv-flow/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { type FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { Pool } from 'pg';

import { loadEnv } from '@/config/env';
import { PrismaClient } from '@/generated/client/client.js';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
    pgPool: Pool;
  }
}

const databasePlugin: FastifyPluginAsync = async (app) => {
  const env = loadEnv();

  const pool = new Pool({ connectionString: env.DATABASE_URL });
  const adapter = new PrismaPg(pool);

  const prisma = new PrismaClient({
    adapter,
    log:
      env.LOG_LEVEL === 'verbose'
        ? ['query', 'info', 'warn', 'error']
        : ['warn', 'error'],
  });

  await prisma.$connect();
  app.log.info('[+] Database connected successfully');

  app.decorate('prisma', prisma);
  app.decorate('pgPool', pool);

  app.addHook('onClose', async (instance) => {
    instance.log.info('[-] Disconnecting from database...');
    await instance.prisma.$disconnect();
    await instance.pgPool.end();
  });
};

export default fp(databasePlugin);
