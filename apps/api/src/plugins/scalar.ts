import apiReference from '@scalar/fastify-api-reference';
import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

const scalarPlugin: FastifyPluginAsync = async (app) => {
  // Register route to serve OpenAPI spec
  app.get('/docs/json', async () => app.swagger());

  await app.register(apiReference, {
    routePrefix: '/docs',
    configuration: {
      url: '/docs/json',
      theme: 'purple',
      darkMode: true,
      layout: 'modern',
      showSidebar: true,
      searchHotKey: 'k',
    },
  });

  app.log.info('[+] Scalar docs available at /docs');
};

export default fp(scalarPlugin);
