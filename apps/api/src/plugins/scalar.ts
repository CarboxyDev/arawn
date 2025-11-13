import apiReference from '@scalar/fastify-api-reference';
import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

const scalarPlugin: FastifyPluginAsync = async (app) => {
  await app.register(apiReference, {
    routePrefix: '/docs',
    configuration: {
      theme: 'purple',
      darkMode: true,
      layout: 'modern',
      showSidebar: true,
      searchHotKey: 'k',
    },
  });

  app.log.info('✅ Scalar API documentation configured at /docs');
};

export default fp(scalarPlugin);
