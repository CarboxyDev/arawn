import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('dotenv-flow', () => ({
  default: {
    config: vi.fn(),
  },
}));

import { loadEnv } from '../index';

describe('loadEnv', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should load and validate valid environment variables', () => {
    process.env.NODE_ENV = 'development';
    process.env.API_URL = 'http://localhost:8080';
    process.env.FRONTEND_URL = 'http://localhost:3000';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.PORT = '8080';

    const env = loadEnv();

    expect(env).toEqual({
      NODE_ENV: 'development',
      API_URL: 'http://localhost:8080',
      FRONTEND_URL: 'http://localhost:3000',
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      PORT: 8080,
    });
  });

  it('should transform PORT string to number', () => {
    process.env.NODE_ENV = 'development';
    process.env.API_URL = 'http://localhost:8080';
    process.env.FRONTEND_URL = 'http://localhost:3000';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.PORT = '3000';

    const env = loadEnv();
    expect(env.PORT).toBe(3000);
    expect(typeof env.PORT).toBe('number');
  });

  it('should throw error for missing required fields', () => {
    process.env.NODE_ENV = 'development';
    process.env.API_URL = 'http://localhost:8080';

    expect(() => loadEnv()).toThrow('Invalid environment variables');
  });

  it('should throw error for invalid URL format', () => {
    process.env.NODE_ENV = 'development';
    process.env.API_URL = 'not-a-url';
    process.env.FRONTEND_URL = 'http://localhost:3000';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.PORT = '8080';

    expect(() => loadEnv()).toThrow('Invalid environment variables');
  });
});
