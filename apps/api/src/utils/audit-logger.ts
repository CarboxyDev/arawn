import type {
  AuditAction,
  AuditResourceType,
} from '@repo/packages-types/audit-log';
import type { FastifyRequest } from 'fastify';

import type { AuditService } from '@/services/audit.service';

interface AuditLogOptions {
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId?: string;
  changes?: Record<string, unknown>;
  userId: string;
  request?: FastifyRequest;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function logAudit(
  auditService: AuditService,
  options: AuditLogOptions
): Promise<void> {
  try {
    await auditService.createLog({
      userId: options.userId,
      action: options.action,
      resourceType: options.resourceType,
      resourceId: options.resourceId,
      changes: options.changes,
      ipAddress: options.ipAddress ?? options.request?.ip ?? null,
      userAgent:
        options.userAgent ?? options.request?.headers['user-agent'] ?? null,
    });
  } catch (error) {
    // Log error but don't fail the original operation
    console.error('Failed to create audit log:', error);
  }
}

export function createBeforeAfterChanges<T>(
  before: T | null,
  after: T | null
): Record<string, unknown> {
  return {
    before: before ?? null,
    after: after ?? null,
  };
}
