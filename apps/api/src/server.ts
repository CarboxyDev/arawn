import closeWithGrace from 'close-with-grace';

import { app } from '@/app';
import { loadEnv } from '@/config/env';

const env = loadEnv();

const start = async () => {
  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    app.log.info(`API server ready at ${env.API_URL}`);
    app.log.info(`Environment: ${env.NODE_ENV}`);
    app.log.info(`CORS enabled for: ${env.FRONTEND_URL}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

const closeListeners = closeWithGrace(
  { delay: Number(process.env.FASTIFY_CLOSE_GRACE_DELAY) || 500 },
  async ({ err }) => {
    if (err) {
      app.log.error(err);
    }
    await app.close();
  }
);

app.addHook('onClose', async () => {
  closeListeners.uninstall();
});

start();
