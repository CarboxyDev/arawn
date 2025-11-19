import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig, mergeConfig } from 'vitest/config';

import { sharedConfig } from '../../config/vitest.shared';

export default mergeConfig(
  sharedConfig,
  defineConfig({
    test: {
      name: '@repo/api',
      include: [
        'src/**/*.spec.ts', // Unit tests (with mocks)
        'test/**/*.spec.ts', // Unit tests
        'test/**/*.integration.spec.ts', // Integration tests (with real DB)
      ],
      globals: true,
      root: './',
      setupFiles: ['./test/setup.ts'],
      // Run tests sequentially for integration tests (shared DB)
      fileParallelism: false, // Disable file-level parallelism
      sequence: {
        concurrent: false, // Disable test-level parallelism
      },
      coverage: {
        thresholds: {
          lines: 80,
          functions: 80,
          branches: 75,
          statements: 80,
        },
      },
    },
    plugins: [tsconfigPaths()],
  })
);
