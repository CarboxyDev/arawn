import { NotFoundError, ValidationError } from '@repo/packages-utils/errors';

import { type LoggerService } from '@/common/logger.service';
import type { PrismaClient } from '@/generated/client/client.js';

export interface ConnectedAccount {
  providerId: string;
  accountId: string;
  connectedAt: Date;
  scope?: string;
}

export interface UserAccounts {
  userId: string;
  hasPassword: boolean;
  connectedAccounts: ConnectedAccount[];
}

export class AccountsService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext('AccountsService');
  }

  async getUserAccounts(userId: string): Promise<UserAccounts> {
    this.logger.info('Fetching user accounts', { userId });

    const accounts = await this.prisma.account.findMany({
      where: { userId },
      select: {
        providerId: true,
        accountId: true,
        createdAt: true,
        scope: true,
        password: true,
      },
    });

    if (accounts.length === 0) {
      throw new NotFoundError('User has no connected accounts');
    }

    const credentialAccount = accounts.find(
      (a) => a.providerId === 'credential'
    );
    const hasPassword = !!(credentialAccount && credentialAccount.password);

    const connectedAccounts: ConnectedAccount[] = accounts
      .filter((a) => a.providerId !== 'credential')
      .map((a) => ({
        providerId: a.providerId,
        accountId: a.accountId,
        connectedAt: a.createdAt,
        scope: a.scope || undefined,
      }));

    if (hasPassword) {
      connectedAccounts.unshift({
        providerId: 'credential',
        accountId: credentialAccount!.accountId,
        connectedAt: credentialAccount!.createdAt,
      });
    }

    return {
      userId,
      hasPassword,
      connectedAccounts,
    };
  }

  async unlinkAccount(
    userId: string,
    providerId: string
  ): Promise<{ success: boolean }> {
    this.logger.info('Unlinking account', { userId, providerId });

    const accounts = await this.prisma.account.findMany({
      where: { userId },
    });

    if (accounts.length <= 1) {
      throw new ValidationError(
        'Cannot unlink the only account. User must have at least one login method.'
      );
    }

    if (providerId === 'credential') {
      throw new ValidationError(
        'Cannot unlink password login. Please change your password or contact support.'
      );
    }

    const account = accounts.find((a) => a.providerId === providerId);
    if (!account) {
      throw new NotFoundError(
        `Account with provider ${providerId} not found for this user`
      );
    }

    await this.prisma.account.delete({
      where: { id: account.id },
    });

    this.logger.info('Account unlinked successfully', { userId, providerId });

    return { success: true };
  }

  async canChangePassword(userId: string): Promise<boolean> {
    const credentialAccount = await this.prisma.account.findFirst({
      where: {
        userId,
        providerId: 'credential',
      },
      select: {
        password: true,
      },
    });

    return !!(credentialAccount && credentialAccount.password);
  }
}
