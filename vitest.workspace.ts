import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'shared/types/vitest.config.ts',
  'shared/utils/vitest.config.ts',
  'shared/config/vitest.config.ts',
  'apps/api/vitest.config.ts',
  'apps/frontend/vitest.config.ts',
]);
