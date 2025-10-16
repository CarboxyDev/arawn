export const features = [
  {
    iconName: 'Rocket' as const,
    title: 'Production Ready',
    description:
      'Helmet security, rate limiting, CORS, and validated environment configs',
  },
  {
    iconName: 'Zap' as const,
    title: 'Fast Development',
    description:
      'Turborepo for optimized builds and pnpm for efficient package management',
  },
  {
    iconName: 'Shield' as const,
    title: 'Type Safe',
    description:
      'Zod schemas with TypeScript for runtime and compile-time safety',
  },
  {
    iconName: 'Workflow' as const,
    title: 'Database Ready',
    description:
      'Prisma ORM with PostgreSQL, migrations, and Docker setup included',
  },
  {
    iconName: 'Code2' as const,
    title: 'Modern UI Components',
    description:
      'shadcn/ui with Radix primitives, Tailwind v4, dark mode, and Framer Motion',
  },
  {
    iconName: 'TestTube' as const,
    title: 'Comprehensive Testing',
    description:
      'Vitest for unit and integration tests with coverage reports across all packages',
  },
  {
    iconName: 'PackageOpen' as const,
    title: 'Shared Packages',
    description:
      'Types, utilities, and config shared across frontend and backend',
  },
  {
    iconName: 'GitBranch' as const,
    title: 'CI/CD Ready',
    description:
      'GitHub Actions workflow with automated testing, type checking, and linting',
  },
  {
    iconName: 'Bot' as const,
    title: 'AI-Assisted Development',
    description:
      'Comprehensive CLAUDE.md enables instant onboarding for AI coding assistants',
  },
] as const;

export const techStack = {
  frontend: {
    title: 'Frontend',
    items: [
      'Next.js 15 (App Router)',
      'React 19',
      'TypeScript 5',
      'Tailwind CSS v4',
      'shadcn/ui + Radix UI',
      'TanStack Query v5',
      'Jotai',
      'React Hook Form + Zod',
      'Framer Motion',
      'Sonner (Toasts)',
      'next-themes (Dark mode)',
    ],
  },
  backend: {
    title: 'Backend',
    items: [
      'NestJS 11',
      'TypeScript 5',
      'Prisma 6 (ORM)',
      'PostgreSQL 17',
      'Zod v4 (Validation)',
      'Swagger + Scalar (API Docs)',
      'Helmet (Security)',
      'Rate Limiting (@nestjs/throttler)',
      'CORS',
    ],
  },
  sharedPackages: {
    title: 'Shared Packages',
    items: [
      'Zod Schemas',
      'Utility Functions',
      'Environment Config (dotenv-flow)',
      'Type Definitions',
    ],
  },
  devOps: {
    title: 'DevOps',
    items: [
      'Turborepo',
      'pnpm Workspaces',
      'Vitest (Testing)',
      'GitHub Actions CI',
      'ESLint 9 + Prettier',
      'Husky + lint-staged',
      'CLAUDE.md (AI Context)',
    ],
  },
} as const;

export const quickStartCommands: Array<{
  command: string;
  tooltip?: string;
}> = [
  {
    command: 'pnpm install',
  },
  {
    command: 'pnpm init:project',
    tooltip:
      'Automated setup: checks prerequisites, creates environment files, starts Docker containers, runs database migrations, and optionally seeds data',
  },
  {
    command: 'pnpm dev',
  },
];
