import { defineConfig } from 'vitest/config';

export const sharedConfig = defineConfig({
  test: {
    globals: true,
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'build/**',
        '.next/**',
        '**/*.config.{js,ts,mjs,mts}',
        '**/*.d.ts',
        '**/index.ts',
        '**/__tests__/**',
        '**/test/**',
        '**/*.spec.{ts,tsx}',
        '**/*.test.{ts,tsx}',
      ],
    },
    setupFiles: [],
  },
});
