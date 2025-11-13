import { afterAll, beforeAll } from 'vitest';

beforeAll(() => {
  // Test environment setup
  process.env.NODE_ENV = 'test';
});

afterAll(() => {
  // Cleanup after all tests
});
