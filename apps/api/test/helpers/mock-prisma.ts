import type { PrismaClient } from '@prisma/client';
import { vi } from 'vitest';

/**
 * Create a mock PrismaClient for testing
 */
export function createMockPrisma(): PrismaClient {
  return {
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    session: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    $connect: vi.fn(),
    $disconnect: vi.fn(),
  } as unknown as PrismaClient;
}
