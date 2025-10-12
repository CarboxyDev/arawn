import { ModuleMetadata } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

export async function createTestingModule(
  metadata: ModuleMetadata
): Promise<TestingModule> {
  const moduleBuilder = Test.createTestingModule(metadata);

  return moduleBuilder.compile();
}

export interface MockRepository<T = any> {
  find: ReturnType<typeof vi.fn>;
  findOne: ReturnType<typeof vi.fn>;
  findOneOrFail: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  save: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  count: ReturnType<typeof vi.fn>;
}

export function createMockRepository<T = any>(): MockRepository<T> {
  return {
    find: vi.fn(),
    findOne: vi.fn(),
    findOneOrFail: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  };
}

export interface MockPrismaService {
  $connect: ReturnType<typeof vi.fn>;
  $disconnect: ReturnType<typeof vi.fn>;
  $transaction: ReturnType<typeof vi.fn>;
  [key: string]: any;
}

export function createMockPrismaService(): MockPrismaService {
  return {
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $transaction: vi.fn(),
  };
}
