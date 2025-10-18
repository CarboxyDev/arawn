import { Injectable, OnModuleInit } from '@nestjs/common';

import { type AuthInstance, createAuthInstance } from '@/auth/auth.config';
import { PrismaService } from '@/database/prisma/prisma.service';

@Injectable()
export class AuthService implements OnModuleInit {
  private authInstance!: AuthInstance;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.authInstance = createAuthInstance(this.prisma);
  }

  getAuthInstance(): AuthInstance {
    return this.authInstance;
  }

  async getHandler() {
    return this.authInstance.handler;
  }
}
