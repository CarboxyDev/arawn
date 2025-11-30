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
