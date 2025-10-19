import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { AuthModule } from '@/auth/auth.module';
import { LoggerModule } from '@/common/logger.module';
import { LoggerMiddleware } from '@/common/middleware/logger.middleware';
import { RequestIdMiddleware } from '@/common/middleware/request-id.middleware';
import { SessionCleanupTask } from '@/common/tasks/session-cleanup.task';
import { PrismaModule } from '@/database/prisma/prisma.module';
import { UsersModule } from '@/modules/users/users.module';

@Module({
  imports: [
    // Rate limiting: 30 requests per 60 seconds per IP
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 30,
      },
    ]),
    ScheduleModule.forRoot(),
    LoggerModule,
    PrismaModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    SessionCleanupTask,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware, LoggerMiddleware).forRoutes('*');
  }
}
