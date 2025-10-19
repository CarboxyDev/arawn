import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { SessionsService } from '@/auth/sessions.service';
import { PrismaService } from '@/database/prisma/prisma.service';

@Injectable()
export class PasswordService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessionsService: SessionsService
  ) {}

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const account = await this.prisma.account.findFirst({
      where: {
        userId,
        providerId: 'credential',
      },
    });

    if (!account || !account.password) {
      throw new BadRequestException('Password authentication not available');
    }

    const isValidPassword = await bcrypt.compare(
      currentPassword,
      account.password
    );

    if (!isValidPassword) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.account.update({
      where: {
        id: account.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    await this.sessionsService.revokeAllUserSessions(userId);
  }
}
