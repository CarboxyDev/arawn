import { z } from 'zod';

import { PaginationSchema } from './pagination';

export const AdminSessionSchema = z.object({
  id: z.string().describe('Unique session identifier'),
  userId: z.string().describe('ID of user who owns this session'),
  ipAddress: z.string().nullable().describe('IP address of the session'),
  userAgent: z
    .string()
    .nullable()
    .describe('User agent string from the browser'),
  createdAt: z.coerce.date().describe('Session creation timestamp'),
  updatedAt: z.coerce.date().describe('Session last update timestamp'),
  expiresAt: z.coerce.date().describe('Session expiration timestamp'),
  user: z.object({
    id: z.string().describe('User ID'),
    name: z.string().nullable().describe('User name'),
    email: z.string().describe('User email address'),
    image: z.string().nullable().describe('User profile image URL'),
  }),
});

export type AdminSession = z.infer<typeof AdminSessionSchema>;

export const QuerySessionsSchema = PaginationSchema.extend({
  search: z.string().optional().describe('Search by user name or email'),
  status: z
    .enum(['active', 'expired', 'all'])
    .default('active')
    .describe('Filter by session status'),
  userId: z.string().optional().describe('Filter by specific user ID'),
  sortBy: z
    .enum(['createdAt', 'expiresAt'])
    .default('createdAt')
    .describe('Field to sort by'),
  sortOrder: z.enum(['asc', 'desc']).default('desc').describe('Sort direction'),
});

export type QuerySessions = z.infer<typeof QuerySessionsSchema>;

export const SessionStatsSchema = z.object({
  activeSessions: z.number().describe('Number of currently active sessions'),
  uniqueUsers: z
    .number()
    .describe('Number of unique users with active sessions'),
  sessionsToday: z.number().describe('Number of sessions created today'),
  expiringSoon: z
    .number()
    .describe('Number of sessions expiring in the next 24 hours'),
});

export type SessionStats = z.infer<typeof SessionStatsSchema>;

export const RevokeSessionParamsSchema = z.object({
  sessionId: z.string().describe('Session ID to revoke'),
});

export const RevokeUserSessionsParamsSchema = z.object({
  userId: z.string().describe('User ID whose sessions to revoke'),
});
