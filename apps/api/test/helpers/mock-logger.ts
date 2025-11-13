import { vi } from 'vitest';

import type { LoggerService } from '@/common/logger.service';

export function createMockLogger(): LoggerService {
  const mockLogger = {
    setContext: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    http: vi.fn(),
    child: vi.fn(),
    minimal: vi.fn(),
    normal: vi.fn(),
    detailed: vi.fn(),
    verbose: vi.fn(),
  } as unknown as LoggerService;

  // Make verbosity methods chainable
  mockLogger.minimal = vi.fn().mockReturnValue(mockLogger);
  mockLogger.normal = vi.fn().mockReturnValue(mockLogger);
  mockLogger.detailed = vi.fn().mockReturnValue(mockLogger);
  mockLogger.verbose = vi.fn().mockReturnValue(mockLogger);
  mockLogger.child = vi.fn().mockReturnValue(mockLogger);

  return mockLogger;
}
