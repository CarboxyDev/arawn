import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { NestApplication } from '@nestjs/core';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);
  private isConnected = false;

  async onModuleInit() {
    const isDevelopment = process.env.NODE_ENV !== 'production';

    try {
      await this.$connect();
      this.isConnected = true;
      this.logger.log('✅ Database connected successfully');
    } catch (error) {
      if (isDevelopment) {
        this.logger.warn(
          '⚠️  Database connection failed - continuing in dev mode'
        );
        this.logger.warn(
          'Database-related operations will fail until connection is established'
        );
        this.isConnected = false;
      } else {
        this.logger.error('❌ Database connection failed in production');
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
