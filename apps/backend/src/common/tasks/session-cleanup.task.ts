import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { LoggerService } from '@/common/logger.service';
import { PrismaService } from '@/database/prisma/prisma.service';

@Injectable()
export class SessionCleanupTask {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext('SessionCleanupTask');
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupExpiredSessions() {
    this.logger.info('Starting expired session cleanup');

    try {
      const result = await this.prisma.session.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      this.logger.info('Expired sessions cleaned up successfully', {
        deletedCount: result.count,
      });
    } catch (error) {
      this.logger.error(
        'Failed to cleanup expired sessions',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }
}
