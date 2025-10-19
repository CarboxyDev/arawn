export const features = [
  {
    iconName: 'Rocket' as const,
    title: 'Production Ready',
    description:
      'Helmet security, rate limiting, CORS, validated environment configs, and GitHub Actions CI/CD',
  },
  {
    iconName: 'Lock' as const,
    title: 'Authentication',
    description:
      'Better-auth with email/password, session management, and OAuth ready for GitHub and Google',
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
    description: 'Types and utilities shared across frontend and backend',
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
      'Next.js 15',
      'React 19',
      'TypeScript',
      'Tailwind CSS v4',
      'shadcn/ui',
      'TanStack Query',
      'Zod',
      'Jotai',
      'React Hook Form',
      'Framer Motion',
      'Sonner',
      'next-themes',
    ],
  },
  backend: {
    title: 'Backend',
    items: [
      'NestJS 11',
      'TypeScript',
      'Prisma',
      'PostgreSQL',
      'Better-auth',
      'Zod',
      'Scalar Docs',
      'Helmet',
      'NestJS Throttler',
      'CORS',
    ],
  },
  sharedPackages: {
    title: 'Shared Packages',
    items: ['Zod Schemas', 'Utility Functions', 'Type Definitions'],
  },
  devOps: {
    title: 'DevOps',
    items: [
      'Turborepo',
      'pnpm Workspaces',
      'Vitest',
      'GitHub Actions CI',
      'ESLint',
      'Prettier',
      'Husky + lint-staged',
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
