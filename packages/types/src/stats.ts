import { z } from 'zod';

export const StatsOverviewSchema = z.object({
  totalUsers: z.number(),
  activeSessionsLast24h: z.number(),
  totalUploads: z.number(),
  storageUsedBytes: z.number(),
  newUsersToday: z.number(),
  newUsersThisWeek: z.number(),
});

export type StatsOverview = z.infer<typeof StatsOverviewSchema>;

export const UserGrowthPointSchema = z.object({
  date: z.string(),
  count: z.number(),
  cumulative: z.number(),
});

export type UserGrowthPoint = z.infer<typeof UserGrowthPointSchema>;

export const SessionActivityPointSchema = z.object({
  date: z.string(),
  count: z.number(),
});

export type SessionActivityPoint = z.infer<typeof SessionActivityPointSchema>;

export const AuthBreakdownSchema = z.object({
  verified: z.number(),
  unverified: z.number(),
  banned: z.number(),
});

export type AuthBreakdown = z.infer<typeof AuthBreakdownSchema>;

export const RoleDistributionItemSchema = z.object({
  role: z.string(),
  count: z.number(),
});

export type RoleDistributionItem = z.infer<typeof RoleDistributionItemSchema>;

export const RecentSignupSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string().nullable(),
  image: z.string().nullable(),
  createdAt: z.string(),
});

export type RecentSignup = z.infer<typeof RecentSignupSchema>;

export const TopActivityUserSchema = z.object({
  userId: z.string(),
  email: z.string(),
  name: z.string().nullable(),
  image: z.string().nullable(),
  actionCount: z.number(),
});

export type TopActivityUser = z.infer<typeof TopActivityUserSchema>;

export const DatabaseHealthSchema = z.enum([
  'connected',
  'degraded',
  'disconnected',
]);

export type DatabaseHealth = z.infer<typeof DatabaseHealthSchema>;

export const SystemHealthSchema = z.object({
  database: DatabaseHealthSchema,
  uptime: z.number(),
  lastChecked: z.string(),
  dbLatencyMs: z.number().optional(),
});

export type SystemHealth = z.infer<typeof SystemHealthSchema>;

export const SystemStatsSchema = z.object({
  overview: StatsOverviewSchema,
  userGrowth: z.array(UserGrowthPointSchema),
  sessionActivity: z.array(SessionActivityPointSchema),
  authBreakdown: AuthBreakdownSchema,
  roleDistribution: z.array(RoleDistributionItemSchema),
  recentSignups: z.array(RecentSignupSchema),
  topActivityUsers: z.array(TopActivityUserSchema),
  systemHealth: SystemHealthSchema,
});

export type SystemStats = z.infer<typeof SystemStatsSchema>;

export const HealthCheckResponseSchema = z.object({
  status: z.enum(['ok', 'degraded', 'error']),
  database: DatabaseHealthSchema,
  dbLatencyMs: z.number(),
  uptime: z.number(),
  timestamp: z.string(),
});

export type HealthCheckResponse = z.infer<typeof HealthCheckResponseSchema>;

export const RealtimeMetricsPointSchema = z.object({
  timestamp: z.number(),
  memory: z.object({
    heapUsedMB: z.number(),
    heapTotalMB: z.number(),
    rssMB: z.number(),
    usedPercent: z.number(),
  }),
  cpu: z.object({
    percentage: z.number(),
  }),
  errors: z.object({
    rate: z.number(),
  }),
  requests: z.object({
    perSecond: z.number(),
    avgResponseTimeMs: z.number(),
  }),
});

export type RealtimeMetricsPoint = z.infer<typeof RealtimeMetricsPointSchema>;
