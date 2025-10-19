import { z } from 'zod';

export const HealthCheckSchema = z.object({
  status: z.enum(['ok', 'error']),
  timestamp: z.string().datetime(),
  version: z.string(),
  uptime: z.number().nonnegative(),
  environment: z.enum(['development', 'staging', 'production']),
});

export type HealthCheck = z.infer<typeof HealthCheckSchema>;
