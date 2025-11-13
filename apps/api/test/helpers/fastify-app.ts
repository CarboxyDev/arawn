import type { FastifyInstance } from 'fastify';
import Fastify from 'fastify';

import { loadEnv } from '@/config/env';

/**
 * Create a Fastify test instance with minimal plugins for testing
 */
export async function createTestApp(): Promise<FastifyInstance> {
  loadEnv(); // Load test environment variables

  const app = Fastify({
    logger: false, // Disable logging in tests
  });

  return app;
}

/**
 * Close the Fastify test instance
 */
export async function closeTestApp(app: FastifyInstance): Promise<void> {
  await app.close();
}
