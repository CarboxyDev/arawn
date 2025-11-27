import { createMockPrisma } from '@test/helpers/mock-prisma';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PrismaClient } from '@/generated/client/client.js';

import { SessionsService } from './sessions.service';

describe('SessionsService', () => {
  let service: SessionsService;
  let prisma: PrismaClient;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new SessionsService(prisma);
  });

  describe('getUserSessions', () => {
    const mockSessions = [
      {
        id: 'session-1',
        userId: 'user-1',
        token: 'token-1',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 86400000),
      },
      {
        id: 'session-2',
        userId: 'user-1',
        token: 'token-2',
        ipAddress: '192.168.1.2',
        userAgent: 'Chrome/120.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 86400000),
      },
    ];

    it('should return all user sessions', async () => {
      vi.mocked(prisma.session.findMany).mockResolvedValue(mockSessions);

      const result = await service.getUserSessions('user-1');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('session-1');
      expect(result[1].id).toBe('session-2');
    });

    it('should return empty array when user has no sessions', async () => {
      vi.mocked(prisma.session.findMany).mockResolvedValue([]);

      const result = await service.getUserSessions('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('revokeSession', () => {
    const mockSession = {
      id: 'session-1',
      userId: 'user-1',
      expiresAt: new Date(Date.now() + 86400000),
      token: 'token-1',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should revoke session successfully', async () => {
      vi.mocked(prisma.session.findFirst).mockResolvedValue(mockSession);
      vi.mocked(prisma.session.delete).mockResolvedValue(mockSession);

      await service.revokeSession('user-1', 'session-1');

      expect(prisma.session.delete).toHaveBeenCalledWith({
        where: { id: 'session-1' },
      });
    });

    it('should throw error when session not found', async () => {
      vi.mocked(prisma.session.findFirst).mockResolvedValue(null);

      await expect(
        service.revokeSession('user-1', 'non-existent')
      ).rejects.toThrow('Session not found');
    });

    it('should throw error when session belongs to different user', async () => {
      vi.mocked(prisma.session.findFirst).mockResolvedValue(null);

      await expect(
        service.revokeSession('user-1', 'session-1')
      ).rejects.toThrow('Session not found');
    });
  });

  describe('revokeAllSessions', () => {
    it('should revoke all sessions except current one', async () => {
      vi.mocked(prisma.session.deleteMany).mockResolvedValue({ count: 3 });

      await service.revokeAllSessions('user-1', 'current-session-id');

      expect(prisma.session.deleteMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          id: { not: 'current-session-id' },
        },
      });
    });

    it('should handle case when no other sessions exist', async () => {
      vi.mocked(prisma.session.deleteMany).mockResolvedValue({ count: 0 });

      await service.revokeAllSessions('user-1', 'current-session-id');

      expect(prisma.session.deleteMany).toHaveBeenCalled();
    });

    it('should revoke all sessions when no current session provided', async () => {
      vi.mocked(prisma.session.deleteMany).mockResolvedValue({ count: 5 });

      await service.revokeAllSessions('user-1');

      expect(prisma.session.deleteMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
        },
      });
    });
  });
});
