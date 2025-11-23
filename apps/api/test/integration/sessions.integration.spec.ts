import { NotFoundError } from '@repo/packages-utils/errors';
import { createMockLogger } from '@test/helpers/mock-logger';
import { getTestPrisma, resetTestDatabase } from '@test/helpers/test-db';
import { beforeEach, describe, expect, it } from 'vitest';

import type { LoggerService } from '@/common/logger.service';
import { SessionsService } from '@/services/sessions.service';

describe('Sessions Service Integration Tests', () => {
  let service: SessionsService;
  let logger: LoggerService;

  beforeEach(async () => {
    await resetTestDatabase();

    logger = createMockLogger();
    const prisma = getTestPrisma();
    service = new SessionsService(prisma);
  });

  describe('getUserSessions', () => {
    it('should return all active sessions for a user', async () => {
      const prisma = getTestPrisma();

      // Create test user
      const user = await prisma.user.create({
        data: {
          email: 'sessions@test.com',
          name: 'Sessions User',
        },
      });

      // Create multiple sessions
      await prisma.session.createMany({
        data: [
          {
            userId: user.id,
            token: 'session-1',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            ipAddress: '192.168.1.1',
            userAgent: 'Chrome Desktop',
          },
          {
            userId: user.id,
            token: 'session-2',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            ipAddress: '192.168.1.2',
            userAgent: 'Safari Mobile',
          },
          {
            userId: user.id,
            token: 'session-3',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            ipAddress: '10.0.0.1',
            userAgent: 'Firefox Desktop',
          },
        ],
      });

      const sessions = await service.getUserSessions(user.id);

      expect(sessions).toHaveLength(3);
      expect(sessions[0].ipAddress).toBeDefined();
      expect(sessions[0].userAgent).toBeDefined();
      expect(sessions[0].expiresAt).toBeInstanceOf(Date);
    });

    it('should exclude expired sessions', async () => {
      const prisma = getTestPrisma();

      const user = await prisma.user.create({
        data: {
          email: 'expired@test.com',
          name: 'Expired User',
        },
      });

      // Create active and expired sessions
      await prisma.session.createMany({
        data: [
          {
            userId: user.id,
            token: 'active-session',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
          {
            userId: user.id,
            token: 'expired-session-1',
            expiresAt: new Date(Date.now() - 1000),
          },
          {
            userId: user.id,
            token: 'expired-session-2',
            expiresAt: new Date(Date.now() - 5000),
          },
        ],
      });

      const sessions = await service.getUserSessions(user.id);

      expect(sessions).toHaveLength(1);
      expect(sessions[0].expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('should return sessions ordered by most recently updated', async () => {
      const prisma = getTestPrisma();

      const user = await prisma.user.create({
        data: {
          email: 'ordered@test.com',
          name: 'Ordered User',
        },
      });

      const now = Date.now();

      // Create sessions with different update times
      const session1 = await prisma.session.create({
        data: {
          userId: user.id,
          token: 'oldest',
          expiresAt: new Date(now + 7 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(now - 3000),
        },
      });

      const session2 = await prisma.session.create({
        data: {
          userId: user.id,
          token: 'middle',
          expiresAt: new Date(now + 7 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(now - 2000),
        },
      });

      const session3 = await prisma.session.create({
        data: {
          userId: user.id,
          token: 'newest',
          expiresAt: new Date(now + 7 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(now - 1000),
        },
      });

      const sessions = await service.getUserSessions(user.id);

      expect(sessions).toHaveLength(3);
      expect(sessions[0].id).toBe(session3.id); // Newest first
      expect(sessions[1].id).toBe(session2.id);
      expect(sessions[2].id).toBe(session1.id);
    });

    it('should return empty array for user with no sessions', async () => {
      const prisma = getTestPrisma();

      const user = await prisma.user.create({
        data: {
          email: 'nosessions@test.com',
          name: 'No Sessions User',
        },
      });

      const sessions = await service.getUserSessions(user.id);

      expect(sessions).toHaveLength(0);
    });
  });

  describe('revokeSession', () => {
    it('should delete a specific session', async () => {
      const prisma = getTestPrisma();

      const user = await prisma.user.create({
        data: {
          email: 'revoke@test.com',
          name: 'Revoke User',
        },
      });

      const session = await prisma.session.create({
        data: {
          userId: user.id,
          token: 'to-revoke',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      await service.revokeSession(user.id, session.id);

      const deletedSession = await prisma.session.findUnique({
        where: { id: session.id },
      });

      expect(deletedSession).toBeNull();
    });

    it('should throw NotFoundError when session does not exist', async () => {
      const prisma = getTestPrisma();

      const user = await prisma.user.create({
        data: {
          email: 'notfound@test.com',
          name: 'Not Found User',
        },
      });

      await expect(
        service.revokeSession(user.id, 'non-existent-session-id')
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when session belongs to different user', async () => {
      const prisma = getTestPrisma();

      const user1 = await prisma.user.create({
        data: {
          email: 'user1@test.com',
          name: 'User 1',
        },
      });

      const user2 = await prisma.user.create({
        data: {
          email: 'user2@test.com',
          name: 'User 2',
        },
      });

      const user2Session = await prisma.session.create({
        data: {
          userId: user2.id,
          token: 'user2-session',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      // User1 tries to revoke User2's session
      await expect(
        service.revokeSession(user1.id, user2Session.id)
      ).rejects.toThrow(NotFoundError);
    });

    it('should only delete the specified session, not others', async () => {
      const prisma = getTestPrisma();

      const user = await prisma.user.create({
        data: {
          email: 'multiple@test.com',
          name: 'Multiple Sessions User',
        },
      });

      const session1 = await prisma.session.create({
        data: {
          userId: user.id,
          token: 'keep-this',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      const session2 = await prisma.session.create({
        data: {
          userId: user.id,
          token: 'delete-this',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      await service.revokeSession(user.id, session2.id);

      const remainingSessions = await prisma.session.findMany({
        where: { userId: user.id },
      });

      expect(remainingSessions).toHaveLength(1);
      expect(remainingSessions[0].id).toBe(session1.id);
    });
  });

  describe('revokeAllSessions', () => {
    it('should delete all sessions except current one', async () => {
      const prisma = getTestPrisma();

      const user = await prisma.user.create({
        data: {
          email: 'revokeall@test.com',
          name: 'Revoke All User',
        },
      });

      const currentSession = await prisma.session.create({
        data: {
          userId: user.id,
          token: 'current',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      await prisma.session.createMany({
        data: [
          {
            userId: user.id,
            token: 'other-1',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
          {
            userId: user.id,
            token: 'other-2',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        ],
      });

      await service.revokeAllSessions(user.id, currentSession.id);

      const remainingSessions = await prisma.session.findMany({
        where: { userId: user.id },
      });

      expect(remainingSessions).toHaveLength(1);
      expect(remainingSessions[0].id).toBe(currentSession.id);
    });

    it('should delete all sessions when no current session provided', async () => {
      const prisma = getTestPrisma();

      const user = await prisma.user.create({
        data: {
          email: 'deleteall@test.com',
          name: 'Delete All User',
        },
      });

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

      await service.revokeAllSessions(user.id);

      const remainingSessions = await prisma.session.findMany({
        where: { userId: user.id },
      });

      expect(remainingSessions).toHaveLength(0);
    });
  });

  describe('revokeAllUserSessions', () => {
    it('should delete all sessions for a user', async () => {
      const prisma = getTestPrisma();

      const user = await prisma.user.create({
        data: {
          email: 'total-revoke@test.com',
          name: 'Total Revoke User',
        },
      });

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

      await service.revokeAllUserSessions(user.id);

      const sessions = await prisma.session.findMany({
        where: { userId: user.id },
      });

      expect(sessions).toHaveLength(0);
    });

    it('should not affect other users sessions', async () => {
      const prisma = getTestPrisma();

      const user1 = await prisma.user.create({
        data: {
          email: 'user1-revoke@test.com',
          name: 'User 1',
        },
      });

      const user2 = await prisma.user.create({
        data: {
          email: 'user2-keep@test.com',
          name: 'User 2',
        },
      });

      await prisma.session.create({
        data: {
          userId: user1.id,
          token: 'user1-session',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      await prisma.session.create({
        data: {
          userId: user2.id,
          token: 'user2-session',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      await service.revokeAllUserSessions(user1.id);

      const user1Sessions = await prisma.session.findMany({
        where: { userId: user1.id },
      });
      const user2Sessions = await prisma.session.findMany({
        where: { userId: user2.id },
      });

      expect(user1Sessions).toHaveLength(0);
      expect(user2Sessions).toHaveLength(1);
    });
  });
});
