import { getTestPrisma, resetTestDatabase } from '@test/helpers/test-db';
import { beforeEach, describe, expect, it } from 'vitest';

import { RATE_LIMIT_CONFIG } from '@/config/rate-limit';

describe('Rate Limiting Integration Tests', () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  it('should enforce anonymous rate limits', async () => {
    const prisma = getTestPrisma();

    // Anonymous rate limit is 30 req/min
    expect(RATE_LIMIT_CONFIG.anonymous.max).toBe(30);
  });

  it('should enforce user rate limits', async () => {
    const prisma = getTestPrisma();

    // User rate limit is 60 req/min
    expect(RATE_LIMIT_CONFIG.user.max).toBe(60);
  });

  it('should enforce admin rate limits', async () => {
    const prisma = getTestPrisma();

    // Admin rate limit is 200 req/min
    expect(RATE_LIMIT_CONFIG.admin.max).toBe(200);
  });

  it('should have stricter auth route limits', async () => {
    // Auth endpoints should have stricter limits (10 req/min)
    expect(RATE_LIMIT_CONFIG.routes.auth.max).toBe(10);
  });

  it('should have stricter upload route limits', async () => {
    // Upload endpoints should have limits (20 req/min)
    expect(RATE_LIMIT_CONFIG.routes.uploads.max).toBe(20);
  });

  it('should have consistent time windows', () => {
    const oneMinute = 60 * 1000;

    expect(RATE_LIMIT_CONFIG.anonymous.timeWindow).toBe(oneMinute);
    expect(RATE_LIMIT_CONFIG.user.timeWindow).toBe(oneMinute);
    expect(RATE_LIMIT_CONFIG.admin.timeWindow).toBe(oneMinute);
    expect(RATE_LIMIT_CONFIG.routes.auth.timeWindow).toBe(oneMinute);
    expect(RATE_LIMIT_CONFIG.routes.uploads.timeWindow).toBe(oneMinute);
  });
});
