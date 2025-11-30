export const TEMPLATE_EXCLUDES = [
  'node_modules',
  '.next',
  '.turbo',
  'dist',
  'build',
  'coverage',
  '.git',
  'pnpm-lock.yaml',
  '*.tsbuildinfo',
  'tsconfig.tsbuildinfo',
  '.env.local',
  '.env.*.local',
  '.DS_Store',
  '.temp',
  '.claude',
  '.cursor',
  'create-blitzpack',
  'apps/api/src/generated',
  'apps/api/public/uploads',
  'scripts/setup.js',
];

export const REPLACEABLE_FILES = [
  'package.json',
  'apps/web/src/config/site.ts',
  'apps/web/src/app/layout.tsx',
  'apps/api/src/plugins/swagger.ts',
  'README.md',
];

export interface TemplateVariables {
  projectName: string;
  projectSlug: string;
  projectDescription: string;
}

export const DEFAULT_DESCRIPTION =
  'A full-stack TypeScript monorepo built with Blitzpack';
