import swc from 'unplugin-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig, mergeConfig } from 'vitest/config';

import { sharedConfig } from '../../config/vitest.shared';

export default mergeConfig(
  sharedConfig,
  defineConfig({
    test: {
      name: '@repo/backend',
      include: ['src/**/*.spec.ts', 'test/**/*.spec.ts'],
      globals: true,
      root: './',
      setupFiles: ['./test/setup.ts'],
      coverage: {
        thresholds: {
          lines: 80,
          functions: 80,
          branches: 75,
          statements: 80,
        },
      },
    },
    plugins: [
      tsconfigPaths(),
      swc.vite({
        module: { type: 'es6' },
      }),
    ],
  })
);
