import { vi } from 'vitest';

import type { AuthorizationService } from '@/services/authorization.service';

export function createMockAuthorizationService(): AuthorizationService {
  return {
    canModifyUser: vi.fn().mockReturnValue(true),
    canDeleteUser: vi.fn().mockReturnValue(true),
    canChangeRole: vi.fn().mockReturnValue(true),
    canChangeEmail: vi.fn().mockReturnValue(true),
    assertCanModifyUser: vi.fn(),
    assertCanDeleteUser: vi.fn(),
    assertCanChangeRole: vi.fn(),
    assertCanChangeEmail: vi.fn(),
  } as unknown as AuthorizationService;
}
