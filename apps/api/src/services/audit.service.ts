import type { PrismaClient } from '@prisma/client';
import type {
  AuditAction,
  AuditLog,
  AuditLogStats,
  AuditResourceType,
  QueryAuditLogs,
} from '@repo/packages-types/audit-log';
import type { PaginatedResponse } from '@repo/packages-types/pagination';

import type { LoggerService } from '@/common/logger.service';

interface CreateAuditLogInput {
  userId: string;
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId?: string | null;
  changes?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export class AuditService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext('AuditService');
  }

  async createLog(input: CreateAuditLogInput): Promise<AuditLog> {
    this.logger.detailed().debug('Creating audit log', {
      action: input.action,
      userId: input.userId,
      resourceType: input.resourceType,
    });

    const auditLog = await this.prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        resourceType: input.resourceType,
        resourceId: input.resourceId ?? null,
        changes: input.changes as unknown as Record<string, never> | undefined,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
      },
    });

    return auditLog as AuditLog;
  }

  async getAuditLogs(
    query: QueryAuditLogs
  ): Promise<PaginatedResponse<AuditLog>> {
    const where: {
      userId?: string;
      action?: string;
      resourceType?: string;
      createdAt?: { gte?: Date; lte?: Date };
      OR?: Array<{
        userId?: { contains: string };
        ipAddress?: { contains: string };
      }>;
    } = {};

    if (query.userId) {
      where.userId = query.userId;
    }

    if (query.action) {
      where.action = query.action;
    }

    if (query.resourceType) {
      where.resourceType = query.resourceType;
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.createdAt.lte = new Date(query.endDate);
      }
    }

    if (query.search) {
      where.OR = [
        { userId: { contains: query.search } },
        { ipAddress: { contains: query.search } },
      ];
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    const totalPages = Math.ceil(total / query.limit);

    return {
      data: logs as AuditLog[],
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
      },
    };
  }

  async getAuditLogStats(): Promise<AuditLogStats> {
    const [totalLogs, logsByAction, logsByResourceType, recentActivity] =
      await Promise.all([
        this.prisma.auditLog.count(),
        this.prisma.auditLog.groupBy({
          by: ['action'],
          _count: { action: true },
          orderBy: { _count: { action: 'desc' } },
        }),
        this.prisma.auditLog.groupBy({
          by: ['resourceType'],
          _count: { resourceType: true },
          orderBy: { _count: { resourceType: 'desc' } },
        }),
        this.getRecentActivityStats(),
      ]);

    return {
      totalLogs,
      logsByAction: logsByAction.map((item) => ({
        action: item.action as AuditAction,
        count: item._count.action,
      })),
      logsByResourceType: logsByResourceType.map((item) => ({
        resourceType: item.resourceType as AuditResourceType,
        count: item._count.resourceType,
      })),
      recentActivity,
    };
  }

  private async getRecentActivityStats(): Promise<
    Array<{ date: string; count: number }>
  > {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const logs = await this.prisma.auditLog.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        createdAt: true,
      },
    });

    const activityByDate = logs.reduce(
      (acc, log) => {
        const date = log.createdAt.toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(activityByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}
