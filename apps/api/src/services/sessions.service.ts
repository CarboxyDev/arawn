import type { PaginatedResponse } from '@repo/packages-types/pagination';
import type { Role } from '@repo/packages-types/role';
import type {
  AdminSession,
  QuerySessions,
  SessionStats,
} from '@repo/packages-types/session';
import { ForbiddenError, NotFoundError } from '@repo/packages-utils/errors';

import type { Prisma, PrismaClient } from '@/generated/client/client.js';
import type { AuthorizationService } from '@/services/authorization.service';

export interface SessionInfo {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  isCurrent?: boolean;
}

export class SessionsService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly authorizationService?: AuthorizationService
  ) {}

  async getUserSessions(userId: string): Promise<SessionInfo[]> {
    const sessions = await this.prisma.session.findMany({
      where: {
        userId,
        expiresAt: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        updatedAt: true,
        expiresAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return sessions;
  }

  async revokeSession(userId: string, sessionId: string): Promise<void> {
    const session = await this.prisma.session.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (!session) {
      throw new NotFoundError('Session not found', {
        sessionId,
        userId,
      });
    }

    await this.prisma.session.delete({
      where: {
        id: sessionId,
      },
    });
  }

  async revokeAllSessions(
    userId: string,
    currentSessionId?: string
  ): Promise<void> {
    await this.prisma.session.deleteMany({
      where: {
        userId,
        ...(currentSessionId && { id: { not: currentSessionId } }),
      },
    });
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    await this.prisma.session.deleteMany({
      where: {
        userId,
      },
    });
  }

  async getAdminSessions(
    query: QuerySessions
  ): Promise<PaginatedResponse<AdminSession>> {
    const { page, limit, search, status, userId, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;
    const now = new Date();

    const where: Prisma.SessionWhereInput = {};

    if (status === 'active') {
      where.expiresAt = { gt: now };
    } else if (status === 'expired') {
      where.expiresAt = { lte: now };
    }

    if (userId) {
      where.userId = userId;
    }

    if (search) {
      where.user = {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const [sessions, total] = await Promise.all([
      this.prisma.session.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.session.count({ where }),
    ]);

    return {
      data: sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getSessionStats(): Promise<SessionStats> {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const [activeSessions, uniqueUsers, sessionsToday, expiringSoon] =
      await Promise.all([
        this.prisma.session.count({
          where: { expiresAt: { gt: now } },
        }),
        this.prisma.session
          .groupBy({
            by: ['userId'],
            where: { expiresAt: { gt: now } },
          })
          .then((r) => r.length),
        this.prisma.session.count({
          where: { createdAt: { gte: todayStart } },
        }),
        this.prisma.session.count({
          where: {
            expiresAt: { gt: now, lte: oneDayFromNow },
          },
        }),
      ]);

    return { activeSessions, uniqueUsers, sessionsToday, expiringSoon };
  }

  async adminRevokeSession(
    actorId: string,
    actorRole: Role,
    sessionId: string
  ): Promise<void> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          select: {
            id: true,
            role: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundError('Session not found', { sessionId });
    }

    // Check if actor can revoke this user's session (role hierarchy check)
    if (this.authorizationService) {
      if (actorId === session.userId) {
        // Allow revoking own sessions
      } else if (
        !this.authorizationService.canModifyUser(
          actorRole,
          session.user.role as Role
        )
      ) {
        throw new ForbiddenError(
          `Insufficient permissions to revoke session for user with role: ${session.user.role}`,
          {
            requiredLevel: 'higher than target',
            actorRole,
            targetRole: session.user.role,
          }
        );
      }
    }

    await this.prisma.session.delete({
      where: { id: sessionId },
    });
  }

  async adminRevokeUserSessions(
    actorId: string,
    actorRole: Role,
    targetUserId: string
  ): Promise<number> {
    // Fetch target user to check their role
    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        role: true,
      },
    });

    if (!targetUser) {
      throw new NotFoundError('User not found', { userId: targetUserId });
    }

    // Check if actor can revoke this user's sessions (role hierarchy check)
    if (this.authorizationService) {
      if (actorId === targetUserId) {
        // Allow revoking own sessions
      } else if (
        !this.authorizationService.canModifyUser(
          actorRole,
          targetUser.role as Role
        )
      ) {
        throw new ForbiddenError(
          `Insufficient permissions to revoke sessions for user with role: ${targetUser.role}`,
          {
            requiredLevel: 'higher than target',
            actorRole,
            targetRole: targetUser.role,
          }
        );
      }
    }

    const result = await this.prisma.session.deleteMany({
      where: { userId: targetUserId },
    });
    return result.count;
  }
}
