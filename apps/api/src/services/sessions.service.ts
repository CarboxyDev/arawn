import type { PrismaClient } from '@prisma/client';

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
  constructor(private readonly prisma: PrismaClient) {}

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
      throw new Error('Session not found');
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
}
