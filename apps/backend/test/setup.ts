import { beforeAll } from 'vitest';

beforeAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.API_URL = 'http://localhost:8080';
  process.env.FRONTEND_URL = 'http://localhost:3000';
  process.env.DATABASE_URL =
    'postgresql://test:test@localhost:5432/test_db?sslmode=disable';
  process.env.PORT = '8080';
});
