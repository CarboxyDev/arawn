import { defineConfig, mergeConfig } from 'vitest/config';

import { sharedConfig } from '../../vitest.shared.config';

export default mergeConfig(
  sharedConfig,
  defineConfig({
    test: {
      name: '@repo/shared-config',
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      coverage: {
        thresholds: {
          lines: 80,
          functions: 80,
          branches: 75,
          statements: 80,
        },
      },
    },
  })
);
