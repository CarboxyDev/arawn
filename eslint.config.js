import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';
import n from 'eslint-plugin-n';
import promise from 'eslint-plugin-promise';
import security from 'eslint-plugin-security';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unicorn from 'eslint-plugin-unicorn';
import unusedImports from 'eslint-plugin-unused-imports';

export default [
  eslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        React: 'readonly',
        URL: 'readonly',
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        Element: 'readonly',
        HTMLElement: 'readonly',
        Event: 'readonly',
        KeyboardEvent: 'readonly',
        MouseEvent: 'readonly',
        CustomEvent: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'unused-imports': unusedImports,
      'simple-import-sort': simpleImportSort,
      unicorn,
      promise,
      n,
      security,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      // Disable base rule in favor of unused-imports
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',

      // Import sorting
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      // Promise best practices
      'promise/prefer-await-to-then': 'error',
      'promise/prefer-await-to-callbacks': 'warn',

      // Unicorn rules (opinionated, adjust as needed)
      'unicorn/filename-case': [
        'error',
        {
          cases: { kebabCase: true, camelCase: true, pascalCase: true },
        },
      ],
      'unicorn/no-null': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/no-array-reduce': 'off',

      // Node.js best practices
      'n/no-unsupported-features/node-builtins': 'off',
      'n/no-missing-import': 'off', // TypeScript handles this
      'n/no-unpublished-import': 'off', // Monorepo workspaces
      'n/prefer-global/process': ['error', 'always'],

      // Security
      'security/detect-object-injection': 'off', // Too many false positives
      'security/detect-non-literal-regexp': 'warn',
      'security/detect-unsafe-regex': 'error',
    },
  },
  {
    ignores: ['dist/**', 'build/**', '.next/**', 'node_modules/**'],
  },
  prettier,
];
