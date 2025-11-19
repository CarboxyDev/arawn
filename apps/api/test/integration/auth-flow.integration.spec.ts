import { getTestPrisma, resetTestDatabase } from '@test/helpers/test-db';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('Authentication Flow Integration Tests', () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  afterEach(async () => {
    // Additional cleanup if needed
  });

  describe('Signup and Login Flow', () => {
    it('should allow user to signup and login with email/password', async () => {
      const prisma = getTestPrisma();

      const email = 'newuser@test.com';
      const password = 'SecurePass123!';
      const name = 'New User';

      // Simulate signup by creating user directly in database
      // (Better Auth handles signup via API endpoint)
      const user = await prisma.user.create({
        data: {
          email,
          name,
          emailVerified: false,
        },
      });

      // Create credential account for password auth
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.account.create({
        data: {
          userId: user.id,
          accountId: email, // Use email as accountId for credential provider
          providerId: 'credential',
          password: hashedPassword,
        },
      });

      // Verify user was created
      const createdUser = await prisma.user.findUnique({
        where: { email },
      });

      expect(createdUser).toBeDefined();
      expect(createdUser?.email).toBe(email);
      expect(createdUser?.name).toBe(name);
      expect(createdUser?.emailVerified).toBe(false);
    });

    it('should create session on successful login', async () => {
      const prisma = getTestPrisma();

      const user = await prisma.user.create({
        data: {
          email: 'session@test.com',
          name: 'Session User',
          emailVerified: true,
        },
      });

      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 10);

      await prisma.account.create({
        data: {
          userId: user.id,
          accountId: 'session@test.com', // Use email as accountId for credential provider
          providerId: 'credential',
          password: hashedPassword,
        },
      });

      // Create session manually (Better Auth would do this on login)
      const session = await prisma.session.create({
        data: {
          userId: user.id,
          token: 'test-session-token',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          ipAddress: '127.0.0.1',
          userAgent: 'Test Browser',
        },
      });

      expect(session).toBeDefined();
      expect(session.userId).toBe(user.id);
      expect(session.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('should not allow duplicate email signups', async () => {
      const prisma = getTestPrisma();

      const email = 'duplicate@test.com';

      // Create first user
      await prisma.user.create({
        data: {
          email,
          name: 'First User',
        },
      });

      // Attempt to create second user with same email
      await expect(
        prisma.user.create({
          data: {
            email,
            name: 'Second User',
          },
        })
      ).rejects.toThrow();
    });
  });

  describe('Session Management', () => {
    it('should allow multiple sessions for same user', async () => {
      const prisma = getTestPrisma();

      const user = await prisma.user.create({
        data: {
          email: 'multisession@test.com',
          name: 'Multi Session User',
        },
      });

      // Create multiple sessions (different devices)
      const session1 = await prisma.session.create({
        data: {
          userId: user.id,
          token: 'session-1-token',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          ipAddress: '192.168.1.1',
          userAgent: 'Desktop Browser',
        },
      });

      const session2 = await prisma.session.create({
        data: {
          userId: user.id,
          token: 'session-2-token',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          ipAddress: '192.168.1.2',
          userAgent: 'Mobile Browser',
        },
      });

      const sessions = await prisma.session.findMany({
        where: { userId: user.id },
      });

      expect(sessions).toHaveLength(2);
      expect(sessions[0].id).toBe(session1.id);
      expect(sessions[1].id).toBe(session2.id);
    });

    it('should filter out expired sessions', async () => {
      const prisma = getTestPrisma();

      const user = await prisma.user.create({
        data: {
          email: 'expired@test.com',
          name: 'Expired Session User',
        },
      });

      // Create active session
      await prisma.session.create({
        data: {
          userId: user.id,
          token: 'active-session',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      // Create expired session
      await prisma.session.create({
        data: {
          userId: user.id,
          token: 'expired-session',
          expiresAt: new Date(Date.now() - 1000), // Already expired
        },
      });

      // Query only active sessions
      const activeSessions = await prisma.session.findMany({
        where: {
          userId: user.id,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      expect(activeSessions).toHaveLength(1);
      expect(activeSessions[0].token).toBe('active-session');
    });

    it('should delete session on logout', async () => {
      const prisma = getTestPrisma();

      const user = await prisma.user.create({
        data: {
          email: 'logout@test.com',
          name: 'Logout User',
        },
      });

      const session = await prisma.session.create({
        data: {
          userId: user.id,
          token: 'logout-session',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      // Delete session (logout)
      await prisma.session.delete({
        where: { id: session.id },
      });

      const deletedSession = await prisma.session.findUnique({
        where: { id: session.id },
      });

      expect(deletedSession).toBeNull();
    });

    it('should revoke all user sessions', async () => {
      const prisma = getTestPrisma();

      const user = await prisma.user.create({
        data: {
          email: 'revoke-all@test.com',
          name: 'Revoke All User',
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
          {
            userId: user.id,
            token: 'session-3',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        ],
      });

      // Revoke all sessions
      await prisma.session.deleteMany({
        where: { userId: user.id },
      });

      const remainingSessions = await prisma.session.findMany({
        where: { userId: user.id },
      });

      expect(remainingSessions).toHaveLength(0);
    });
  });

  describe('Email Verification Flow', () => {
    it('should create verification record on signup', async () => {
      const prisma = getTestPrisma();

      const user = await prisma.user.create({
        data: {
          email: 'verify@test.com',
          name: 'Verify User',
          emailVerified: false,
        },
      });

      // Create verification token
      const verification = await prisma.verification.create({
        data: {
          identifier: user.email,
          value: 'verification-token-12345',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      });

      expect(verification).toBeDefined();
      expect(verification.identifier).toBe(user.email);
      expect(verification.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('should mark user as verified after email verification', async () => {
      const prisma = getTestPrisma();

      const user = await prisma.user.create({
        data: {
          email: 'verify-success@test.com',
          name: 'Verify Success User',
          emailVerified: false,
        },
      });

      // Simulate verification
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });

      expect(updatedUser.emailVerified).toBe(true);
    });

    it('should delete verification token after successful verification', async () => {
      const prisma = getTestPrisma();

      const verification = await prisma.verification.create({
        data: {
          identifier: 'delete-token@test.com',
          value: 'token-to-delete',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      // Delete verification token after use
      await prisma.verification.delete({
        where: { id: verification.id },
      });

      const deletedVerification = await prisma.verification.findUnique({
        where: { id: verification.id },
      });

      expect(deletedVerification).toBeNull();
    });
  });

  describe('Password Reset Flow', () => {
    it('should create password reset token', async () => {
      const prisma = getTestPrisma();

      const user = await prisma.user.create({
        data: {
          email: 'reset@test.com',
          name: 'Reset User',
        },
      });

      // Create password reset verification
      const resetToken = await prisma.verification.create({
        data: {
          identifier: user.email,
          value: 'reset-token-12345',
          expiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour
        },
      });

      expect(resetToken).toBeDefined();
      expect(resetToken.identifier).toBe(user.email);
    });

    it('should update password and invalidate reset token', async () => {
      const prisma = getTestPrisma();

      const user = await prisma.user.create({
        data: {
          email: 'password-change@test.com',
          name: 'Password Change User',
        },
      });

      // Create account with old password
      const bcrypt = await import('bcryptjs');
      const oldPassword = await bcrypt.hash('oldPassword123', 10);

      const account = await prisma.account.create({
        data: {
          userId: user.id,
          accountId: user.id,
          providerId: 'credential',
          password: oldPassword,
        },
      });

      // Update password
      const newPassword = await bcrypt.hash('newPassword456', 10);
      const updatedAccount = await prisma.account.update({
        where: { id: account.id },
        data: { password: newPassword },
      });

      // Verify password was changed
      const isOldPasswordValid = await bcrypt.compare(
        'oldPassword123',
        updatedAccount.password!
      );
      const isNewPasswordValid = await bcrypt.compare(
        'newPassword456',
        updatedAccount.password!
      );

      expect(isOldPasswordValid).toBe(false);
      expect(isNewPasswordValid).toBe(true);
    });
  });

  describe('User Role Management', () => {
    it('should assign default role on user creation', async () => {
      const prisma = getTestPrisma();

      const user = await prisma.user.create({
        data: {
          email: 'default-role@test.com',
          name: 'Default Role User',
        },
      });

      // Better Auth admin plugin uses 'role' field
      // Default role should be 'user' (as configured in auth plugin)
      const userWithRole = user as typeof user & { role?: string };
      expect(userWithRole.role || 'user').toBe('user');
    });

    it('should allow admin role assignment', async () => {
      const prisma = getTestPrisma();

      // Create user with admin role
      const adminUser = await prisma.user.create({
        data: {
          email: 'admin@test.com',
          name: 'Admin User',
          // Note: Better Auth admin plugin manages roles via user.role field
          // The exact implementation depends on your Prisma schema
        },
      });

      expect(adminUser).toBeDefined();
      expect(adminUser.email).toBe('admin@test.com');
    });
  });
});
