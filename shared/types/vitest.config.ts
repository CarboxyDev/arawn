import { defineConfig, mergeConfig } from 'vitest/config';

import { sharedConfig } from '../../vitest.shared.config';

export default mergeConfig(
  sharedConfig,
  defineConfig({
    test: {
      name: '@repo/shared-types',
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      coverage: {
        thresholds: {
          lines: 90,
          functions: 90,
          branches: 85,
          statements: 90,
        },
      },
    },
  })
);
