import type {
  AuthBreakdown,
  HealthCheckResponse,
  RecentSignup,
  RoleDistributionItem,
  SessionActivityPoint,
  StatsOverview,
  SystemHealth,
  SystemStats,
  UserGrowthPoint,
} from '@repo/packages-types/stats';

import type { LoggerService } from '@/common/logger.service';
import type { PrismaClient } from '@/generated/client/client.js';

const SERVER_START_TIME = Date.now();

export class StatsService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext('StatsService');
  }

  async getSystemStats(): Promise<SystemStats> {
    const [
      overview,
      userGrowth,
      sessionActivity,
      authBreakdown,
      roleDistribution,
      recentSignups,
      systemHealth,
    ] = await Promise.all([
      this.getOverview(),
      this.getUserGrowth(),
      this.getSessionActivity(),
      this.getAuthBreakdown(),
      this.getRoleDistribution(),
      this.getRecentSignups(),
      this.getSystemHealth(),
    ]);

    return {
      overview,
      userGrowth,
      sessionActivity,
      authBreakdown,
      roleDistribution,
      recentSignups,
      systemHealth,
    };
  }

  private async getOverview(): Promise<StatsOverview> {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeSessionsLast24h,
      totalUploads,
      storageResult,
      newUsersToday,
      newUsersThisWeek,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.session.count({
        where: {
          createdAt: { gte: dayAgo },
          expiresAt: { gt: now },
        },
      }),
      this.prisma.upload.count(),
      this.prisma.upload.aggregate({
        _sum: { size: true },
      }),
      this.prisma.user.count({
        where: { createdAt: { gte: todayStart } },
      }),
      this.prisma.user.count({
        where: { createdAt: { gte: weekAgo } },
      }),
    ]);

    return {
      totalUsers,
      activeSessionsLast24h,
      totalUploads,
      storageUsedBytes: storageResult._sum.size ?? 0,
      newUsersToday,
      newUsersThisWeek,
    };
  }

  private async getUserGrowth(): Promise<UserGrowthPoint[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const users = await this.prisma.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const totalBeforeRange = await this.prisma.user.count({
      where: { createdAt: { lt: thirtyDaysAgo } },
    });

    const dailyCounts: Record<string, number> = {};
    const dates: string[] = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dates.push(dateStr);
      dailyCounts[dateStr] = 0;
    }

    users.forEach((user) => {
      const dateStr = user.createdAt.toISOString().split('T')[0];
      if (dailyCounts[dateStr] !== undefined) {
        dailyCounts[dateStr]++;
      }
    });

    let cumulative = totalBeforeRange;
    return dates.map((date) => {
      cumulative += dailyCounts[date];
      return {
        date,
        count: dailyCounts[date],
        cumulative,
      };
    });
  }

  private async getSessionActivity(): Promise<SessionActivityPoint[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sessions = await this.prisma.session.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    });

    const dailyCounts: Record<string, number> = {};
    const dates: string[] = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dates.push(dateStr);
      dailyCounts[dateStr] = 0;
    }

    sessions.forEach((session) => {
      const dateStr = session.createdAt.toISOString().split('T')[0];
      if (dailyCounts[dateStr] !== undefined) {
        dailyCounts[dateStr]++;
      }
    });

    return dates.map((date) => ({
      date,
      count: dailyCounts[date],
    }));
  }

  private async getAuthBreakdown(): Promise<AuthBreakdown> {
    const [verified, unverified, banned] = await Promise.all([
      this.prisma.user.count({ where: { emailVerified: true, banned: false } }),
      this.prisma.user.count({
        where: { emailVerified: false, banned: false },
      }),
      this.prisma.user.count({ where: { banned: true } }),
    ]);

    return { verified, unverified, banned };
  }

  private async getRoleDistribution(): Promise<RoleDistributionItem[]> {
    const roles = await this.prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
      orderBy: { _count: { role: 'desc' } },
    });

    return roles.map((r) => ({
      role: r.role,
      count: r._count.role,
    }));
  }

  private async getRecentSignups(): Promise<RecentSignup[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        createdAt: true,
      },
    });

    return users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      image: u.image,
      createdAt: u.createdAt.toISOString(),
    }));
  }

  private async getSystemHealth(): Promise<SystemHealth> {
    const start = Date.now();
    let database: 'connected' | 'degraded' | 'disconnected' = 'connected';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      const latency = Date.now() - start;
      if (latency > 500) {
        database = 'degraded';
      }
    } catch {
      database = 'disconnected';
    }

    return {
      database,
      uptime: Math.floor((Date.now() - SERVER_START_TIME) / 1000),
      lastChecked: new Date().toISOString(),
      dbLatencyMs: Date.now() - start,
    };
  }

  async getHealthCheck(): Promise<HealthCheckResponse> {
    const start = Date.now();
    let database: 'connected' | 'degraded' | 'disconnected' = 'connected';
    let status: 'ok' | 'degraded' | 'error' = 'ok';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      const latency = Date.now() - start;
      if (latency > 500) {
        database = 'degraded';
        status = 'degraded';
      }
    } catch {
      database = 'disconnected';
      status = 'error';
    }

    return {
      status,
      database,
      dbLatencyMs: Date.now() - start,
      uptime: Math.floor((Date.now() - SERVER_START_TIME) / 1000),
      timestamp: new Date().toISOString(),
    };
  }
}
