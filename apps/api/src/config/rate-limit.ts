export const RATE_LIMIT_CONFIG = {
  // Role-based rate limits (requests per minute)
  admin: {
    max: 200,
    timeWindow: 60 * 1000,
  },
  user: {
    max: 60,
    timeWindow: 60 * 1000,
  },
  anonymous: {
    max: 30,
    timeWindow: 60 * 1000,
  },

  // Route-specific overrides
  routes: {
    auth: {
      max: 10,
      timeWindow: 60 * 1000,
    },
    uploads: {
      max: 20,
      timeWindow: 60 * 1000,
    },
  },
} as const;

export type RateLimitRole = 'admin' | 'user' | 'anonymous';
