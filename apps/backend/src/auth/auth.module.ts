import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { AuthController } from '@/auth/auth.controller';
import { AuthService } from '@/auth/auth.service';
import { AuthGuard } from '@/auth/guards/auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { PasswordController } from '@/auth/password.controller';
import { PasswordService } from '@/auth/password.service';
import { SessionsController } from '@/auth/sessions.controller';
import { SessionsService } from '@/auth/sessions.service';
import { PrismaModule } from '@/database/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController, SessionsController, PasswordController],
  providers: [
    AuthService,
    SessionsService,
    PasswordService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [AuthService, SessionsService, PasswordService],
})
export class AuthModule {}
