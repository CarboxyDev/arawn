import type { PrismaClient } from '@prisma/client';
import { UnauthorizedError, ValidationError } from '@repo/packages-utils';
import * as bcrypt from 'bcryptjs';

import { SessionsService } from '@/services/sessions.service';

export class PasswordService {
  constructor(
    private readonly prisma: PrismaClient,
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
      throw new ValidationError('Password authentication not available', {
        userId,
      });
    }

    const isValidPassword = await bcrypt.compare(
      currentPassword,
      account.password
    );

    if (!isValidPassword) {
      throw new UnauthorizedError('Current password is incorrect');
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
