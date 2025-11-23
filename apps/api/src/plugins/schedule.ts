import fastifySchedule from '@fastify/schedule';
import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { SimpleIntervalJob, Task } from 'toad-scheduler';

const schedulePlugin: FastifyPluginAsync = async (app) => {
  // Register the schedule plugin
  await app.register(fastifySchedule);

  // Session cleanup task - runs every day at 3 AM (86400 seconds = 24 hours)
  const sessionCleanupTask = new Task('session-cleanup', async () => {
    const logger = app.logger.child('SessionCleanupTask');
    logger.info('Starting expired session cleanup');

    try {
      const result = await app.prisma.session.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      logger.info('Expired sessions cleaned up successfully', {
        deletedCount: result.count,
      });
    } catch (error) {
      logger.error(
        'Failed to cleanup expired sessions',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  });

  // Create a job that runs every 24 hours
  const job = new SimpleIntervalJob(
    { days: 1, runImmediately: false },
    sessionCleanupTask
  );

  // Add the job to the scheduler
  app.scheduler.addSimpleIntervalJob(job);

  app.log.info('[+] Scheduled tasks configured');

  app.addHook('onClose', async (instance) => {
    instance.log.info('[-] Stopping scheduled tasks...');
    instance.scheduler.stop();
  });
};

export default fp(schedulePlugin);
