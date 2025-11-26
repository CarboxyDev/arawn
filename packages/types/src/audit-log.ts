import { z } from 'zod';

import { PaginationSchema } from './pagination';

export const AuditActionSchema = z.enum([
  'user.login',
  'user.logout',
  'user.login_failed',
  'user.created',
  'user.updated',
  'user.deleted',
  'user.role_changed',
  'session.revoked',
  'session.revoked_all',
  'session.admin_revoked',
  'session.admin_revoked_all',
  'password.changed',
  'account.linked',
  'account.unlinked',
  'email.verified',
]);

export type AuditAction = z.infer<typeof AuditActionSchema>;

export const AuditResourceTypeSchema = z.enum([
  'user',
  'session',
  'account',
  'password',
  'email',
]);

export type AuditResourceType = z.infer<typeof AuditResourceTypeSchema>;

export const AuditLogSchema = z.object({
  id: z.string().cuid(),
  userId: z.string().cuid(),
  action: AuditActionSchema,
  resourceType: AuditResourceTypeSchema,
  resourceId: z.string().nullable(),
  changes: z.record(z.string(), z.unknown()).nullable(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  createdAt: z.date().or(z.string().datetime()),
});

export type AuditLog = z.infer<typeof AuditLogSchema>;

export const QueryAuditLogsSchema = PaginationSchema.extend({
  userId: z.string().cuid().optional(),
  action: AuditActionSchema.optional(),
  resourceType: AuditResourceTypeSchema.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'action', 'resourceType']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type QueryAuditLogs = z.infer<typeof QueryAuditLogsSchema>;

export const AuditLogStatsSchema = z.object({
  totalLogs: z.number().int().nonnegative(),
  logsByAction: z.array(
    z.object({
      action: AuditActionSchema,
      count: z.number().int().nonnegative(),
    })
  ),
  logsByResourceType: z.array(
    z.object({
      resourceType: AuditResourceTypeSchema,
      count: z.number().int().nonnegative(),
    })
  ),
  recentActivity: z.array(
    z.object({
      date: z.string(),
      count: z.number().int().nonnegative(),
    })
  ),
});

export type AuditLogStats = z.infer<typeof AuditLogStatsSchema>;
