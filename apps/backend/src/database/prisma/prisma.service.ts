import { Injectable, OnModuleInit } from '@nestjs/common';
import { NestApplication } from '@nestjs/core';
import { PrismaClient } from '@prisma/client';

import { LoggerService } from '@/common/logger.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger: LoggerService;
  private isConnected = false;

  constructor(logger: LoggerService) {
    super({
      log:
        process.env.LOG_LEVEL === 'detailed' ||
        process.env.LOG_LEVEL === 'verbose'
          ? [
              { emit: 'event', level: 'query' },
              { emit: 'event', level: 'error' },
              { emit: 'event', level: 'warn' },
            ]
          : [
              { emit: 'event', level: 'error' },
              { emit: 'event', level: 'warn' },
            ],
    });

    this.logger = logger.child('PrismaService');

    if (
      process.env.LOG_LEVEL === 'detailed' ||
      process.env.LOG_LEVEL === 'verbose'
    ) {
      this.$on('query' as never, (e: { query: string; duration: number }) => {
        this.logger
          .detailed()
          .debug('SQL Query', { query: e.query, duration: e.duration });
      });
    }

    this.$on('error' as never, (e: { message: string }) => {
      this.logger.error('Database error', new Error(e.message));
    });

    this.$on('warn' as never, (e: { message: string }) => {
      this.logger.warn('Database warning', { message: e.message });
    });
  }

  async onModuleInit() {
    const isDevelopment = process.env.NODE_ENV !== 'production';

    try {
      await this.$connect();
      this.isConnected = true;
      this.logger.info('Database connected successfully');
    } catch (error) {
      if (isDevelopment) {
        this.logger.warn('Database connection failed - continuing in dev mode');
        this.logger.warn(
          'Database operations will fail until connection is established'
        );
        this.isConnected = false;
      } else {
        this.logger.error(
          'Database connection failed in production',
          error instanceof Error ? error : new Error(String(error))
        );
        throw error;
      }
    }
  }

  async enableShutdownHooks(app: NestApplication) {
    process.on('beforeExit', async () => {
      await app.close();
    });
  }

  get connected(): boolean {
    return this.isConnected;
  }
}
