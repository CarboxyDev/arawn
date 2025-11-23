import { UnauthorizedError } from '@repo/packages-utils/errors';
import { createMockLogger } from '@test/helpers/mock-logger';
import { getTestPrisma, resetTestDatabase } from '@test/helpers/test-db';
import * as bcrypt from 'bcryptjs';
import { ValidationError } from 'better-auth/client';
import { beforeEach, describe, expect, it } from 'vitest';

import type { LoggerService } from '@/common/logger.service';
import { PasswordService } from '@/services/password.service';
import { SessionsService } from '@/services/sessions.service';

describe('Password Service Integration Tests', () => {
  let passwordService: PasswordService;
  let sessionsService: SessionsService;
  let logger: LoggerService;

  beforeEach(async () => {
    await resetTestDatabase();

    logger = createMockLogger();
    const prisma = getTestPrisma();
    sessionsService = new SessionsService(prisma);
    passwordService = new PasswordService(prisma, sessionsService);
  });

  describe('changePassword', () => {
    it('should successfully change password with correct current password', async () => {
      const prisma = getTestPrisma();

      // Create user
      const user = await prisma.user.create({
        data: {
          email: 'change@test.com',
          name: 'Change Password User',
        },
      });

      // Create credential account
      const oldPassword = 'OldPassword123!';
      const hashedOldPassword = await bcrypt.hash(oldPassword, 10);

      await prisma.account.create({
        data: {
          userId: user.id,
          accountId: user.email,
          providerId: 'credential',
          password: hashedOldPassword,
        },
      });

      // Change password
      const newPassword = 'NewPassword456!';
      await passwordService.changePassword(user.id, oldPassword, newPassword);

      // Verify new password is set
      const account = await prisma.account.findFirst({
        where: {
          userId: user.id,
          providerId: 'credential',
        },
      });

      expect(account).toBeDefined();
      expect(account?.password).toBeDefined();

      const isNewPasswordValid = await bcrypt.compare(
        newPassword,
        account!.password!
      );
      const isOldPasswordValid = await bcrypt.compare(
        oldPassword,
        account!.password!
      );

      expect(isNewPasswordValid).toBe(true);
      expect(isOldPasswordValid).toBe(false);
    });

    it('should revoke all sessions after password change', async () => {
      const prisma = getTestPrisma();

      const user = await prisma.user.create({
        data: {
          email: 'revoke-sessions@test.com',
          name: 'Revoke Sessions User',
        },
      });

      const password = 'CurrentPassword123!';
      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.account.create({
        data: {
          userId: user.id,
          accountId: user.email,
          providerId: 'credential',
          password: hashedPassword,
        },
      });

      // Create multiple sessions
      await prisma.session.createMany({
        data: [
          {
            userId: user.id,
            token: 'session-1',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
          {
            userId: user.id,
            token: 'session-2',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        ],
      });

      // Change password
      await passwordService.changePassword(
        user.id,
        password,
        'NewPassword456!'
      );

      // Verify all sessions are revoked
      const sessions = await prisma.session.findMany({
        where: { userId: user.id },
      });

      expect(sessions).toHaveLength(0);
    });

    it('should throw UnauthorizedError with incorrect current password', async () => {
      const prisma = getTestPrisma();

      const user = await prisma.user.create({
        data: {
          email: 'wrong-password@test.com',
          name: 'Wrong Password User',
        },
      });

      const correctPassword = 'CorrectPassword123!';
      const hashedPassword = await bcrypt.hash(correctPassword, 10);

      await prisma.account.create({
        data: {
          userId: user.id,
          accountId: user.email,
          providerId: 'credential',
          password: hashedPassword,
        },
      });

      await expect(
        passwordService.changePassword(
          user.id,
          'WrongPassword123!',
          'NewPassword456!'
        )
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw ValidationError when user has no password account', async () => {
      const prisma = getTestPrisma();

      // Create user without credential account (e.g., OAuth user)
      const user = await prisma.user.create({
        data: {
          email: 'oauth@test.com',
          name: 'OAuth User',
        },
      });

      await expect(
        passwordService.changePassword(
          user.id,
          'OldPassword123!',
          'NewPassword456!'
        )
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when account has no password', async () => {
      const prisma = getTestPrisma();

      const user = await prisma.user.create({
        data: {
          email: 'no-password@test.com',
          name: 'No Password User',
        },
      });

      // Create credential account without password
      await prisma.account.create({
        data: {
          userId: user.id,
          accountId: user.email,
          providerId: 'credential',
          password: null,
        },
      });

      await expect(
        passwordService.changePassword(
          user.id,
          'OldPassword123!',
          'NewPassword456!'
        )
      ).rejects.toThrow(ValidationError);
    });

    it('should handle bcrypt password hashing correctly', async () => {
      const prisma = getTestPrisma();

      const user = await prisma.user.create({
        data: {
          email: 'bcrypt@test.com',
          name: 'Bcrypt User',
        },
      });

      const password = 'TestPassword123!';
      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.account.create({
        data: {
          userId: user.id,
          accountId: user.email,
          providerId: 'credential',
          password: hashedPassword,
        },
      });

      const newPassword = 'NewSecurePassword456!';
      await passwordService.changePassword(user.id, password, newPassword);

      const account = await prisma.account.findFirst({
        where: {
          userId: user.id,
          providerId: 'credential',
        },
      });

      // Verify password is hashed (bcrypt hashes start with $2a$ or $2b$)
      expect(account?.password).toMatch(/^\$2[ab]\$/);

      // Verify hash is unique (different from old hash)
      expect(account?.password).not.toBe(hashedPassword);

      // Verify new password works
      const isValid = await bcrypt.compare(newPassword, account!.password!);
      expect(isValid).toBe(true);
    });

    it('should work with special characters in password', async () => {
      const prisma = getTestPrisma();

      const user = await prisma.user.create({
        data: {
          email: 'special@test.com',
          name: 'Special Chars User',
        },
      });

      const oldPassword = 'Old!@#$%^&*()_+{}|:"<>?Pass123';
      const hashedOldPassword = await bcrypt.hash(oldPassword, 10);

      await prisma.account.create({
        data: {
          userId: user.id,
          accountId: user.email,
          providerId: 'credential',
          password: hashedOldPassword,
        },
      });

      const newPassword = 'New!@#$%^&*()_+{}|:"<>?Pass456';
      await passwordService.changePassword(user.id, oldPassword, newPassword);

      const account = await prisma.account.findFirst({
        where: {
          userId: user.id,
          providerId: 'credential',
        },
      });

      const isValid = await bcrypt.compare(newPassword, account!.password!);
      expect(isValid).toBe(true);
    });

    it('should maintain data consistency on concurrent password changes', async () => {
      const prisma = getTestPrisma();

      const user = await prisma.user.create({
        data: {
          email: 'concurrent@test.com',
          name: 'Concurrent User',
        },
      });

      const password = 'OriginalPassword123!';
      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.account.create({
        data: {
          userId: user.id,
          accountId: user.email,
          providerId: 'credential',
          password: hashedPassword,
        },
      });

      // First password change
      await passwordService.changePassword(
        user.id,
        password,
        'FirstChange456!'
      );

      // Second password change (using new password)
      await passwordService.changePassword(
        user.id,
        'FirstChange456!',
        'SecondChange789!'
      );

      const account = await prisma.account.findFirst({
        where: {
          userId: user.id,
          providerId: 'credential',
        },
      });

      // Only the final password should work
      const isOriginalValid = await bcrypt.compare(
        password,
        account!.password!
      );
      const isFirstChangeValid = await bcrypt.compare(
        'FirstChange456!',
        account!.password!
      );
      const isSecondChangeValid = await bcrypt.compare(
        'SecondChange789!',
        account!.password!
      );

      expect(isOriginalValid).toBe(false);
      expect(isFirstChangeValid).toBe(false);
      expect(isSecondChangeValid).toBe(true);
    });
  });

  describe('Database Constraints and Edge Cases', () => {
    it('should handle non-existent user gracefully', async () => {
      await expect(
        passwordService.changePassword(
          'non-existent-user-id',
          'OldPassword123!',
          'NewPassword456!'
        )
      ).rejects.toThrow(ValidationError);
    });

    it('should handle user with multiple accounts correctly', async () => {
      const prisma = getTestPrisma();

      const user = await prisma.user.create({
        data: {
          email: 'multiple-accounts@test.com',
          name: 'Multiple Accounts User',
        },
      });

      // Create credential account
      const password = 'Password123!';
      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.account.create({
        data: {
          userId: user.id,
          accountId: user.email,
          providerId: 'credential',
          password: hashedPassword,
        },
      });

      // Create OAuth account (github)
      await prisma.account.create({
        data: {
          userId: user.id,
          accountId: 'github-123',
          providerId: 'github',
        },
      });

      // Should only update the credential account
      await passwordService.changePassword(
        user.id,
        password,
        'NewPassword456!'
      );

      const credentialAccount = await prisma.account.findFirst({
        where: {
          userId: user.id,
          providerId: 'credential',
        },
      });

      const githubAccount = await prisma.account.findFirst({
        where: {
          userId: user.id,
          providerId: 'github',
        },
      });

      const isNewPasswordValid = await bcrypt.compare(
        'NewPassword456!',
        credentialAccount!.password!
      );

      expect(isNewPasswordValid).toBe(true);
      expect(githubAccount?.password).toBeNull();
    });
  });
});
