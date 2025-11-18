import { afterAll, beforeAll } from 'vitest';

import { cleanupTestDatabase, setupTestDatabase } from './helpers/test-db';

beforeAll(async () => {
  // Set test environment variables before database setup
  process.env.NODE_ENV = 'test';

  // Set minimal required env vars for tests
  // These are only needed for test infrastructure, not for actual test assertions
  process.env.BETTER_AUTH_SECRET =
    process.env.BETTER_AUTH_SECRET || 'test-secret-minimum-32-characters-long';
  process.env.BETTER_AUTH_URL =
    process.env.BETTER_AUTH_URL || 'http://localhost:8080';
  process.env.API_URL = process.env.API_URL || 'http://localhost:8080';
  process.env.FRONTEND_URL =
    process.env.FRONTEND_URL || 'http://localhost:3000';
  process.env.COOKIE_SECRET = process.env.COOKIE_SECRET || 'test-cookie-secret';
  process.env.PORT = process.env.PORT || '8080';
  process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'minimal';

  // DATABASE_URL is set in test-db.ts based on your .env.local

  // Setup test database (runs migrations)
  await setupTestDatabase();
});

afterAll(async () => {
  // Cleanup test database
  await cleanupTestDatabase();
});
