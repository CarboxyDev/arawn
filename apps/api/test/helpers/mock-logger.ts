import { vi } from 'vitest';

import type { LoggerService } from '@/common/logger.service';

/**
 * Create a mock LoggerService for testing
 */
export function createMockLogger(): LoggerService {
  const mockLogger = {
    setContext: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    http: vi.fn(),
    child: vi.fn(),
    minimal: vi.fn(),
    normal: vi.fn(),
    detailed: vi.fn(),
    verbose: vi.fn(),
  } as unknown as LoggerService;

  // Chain methods should return the logger itself
  mockLogger.minimal = vi.fn(() => mockLogger);
  mockLogger.normal = vi.fn(() => mockLogger);
  mockLogger.detailed = vi.fn(() => mockLogger);
  mockLogger.verbose = vi.fn(() => mockLogger);
  mockLogger.child = vi.fn(() => mockLogger);

  return mockLogger;
}
