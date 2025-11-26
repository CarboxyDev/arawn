import { z } from 'zod';

import { PaginationSchema } from './pagination';

export const AdminSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  expiresAt: z.coerce.date(),
  user: z.object({
    id: z.string(),
    name: z.string().nullable(),
    email: z.string(),
    image: z.string().nullable(),
  }),
});

export type AdminSession = z.infer<typeof AdminSessionSchema>;

export const QuerySessionsSchema = PaginationSchema.extend({
  search: z.string().optional(),
  status: z.enum(['active', 'expired', 'all']).default('active'),
  userId: z.string().optional(),
  sortBy: z.enum(['createdAt', 'expiresAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type QuerySessions = z.infer<typeof QuerySessionsSchema>;

export const SessionStatsSchema = z.object({
  activeSessions: z.number(),
  uniqueUsers: z.number(),
  sessionsToday: z.number(),
  expiringSoon: z.number(),
});

export type SessionStats = z.infer<typeof SessionStatsSchema>;

export const RevokeSessionParamsSchema = z.object({
  sessionId: z.string(),
});

export const RevokeUserSessionsParamsSchema = z.object({
  userId: z.string(),
});
