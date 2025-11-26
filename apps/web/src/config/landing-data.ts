export const features = [
  {
    iconName: 'Rocket' as const,
    title: 'Production Ready',
    description:
      'Helmet security, rate limiting, CORS, validated environment configs, and GitHub Actions CI/CD',
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
      'Zod schemas with TypeScript everywhere for runtime and compile-time safety',
  },
  {
    iconName: 'Code2' as const,
    title: 'Modern UI Components',
    description:
      'shadcn/ui with Radix primitives, Tailwind v4, dark mode, and Framer Motion',
  },
  {
    iconName: 'Workflow' as const,
    title: 'Database Ready',
    description:
      'Prisma ORM with PostgreSQL, migrations, better-auth and Docker setup',
  },
  {
    iconName: 'Lock' as const,
    title: 'Authentication',
    description:
      'Better-auth with email/password, session management and OAuth support',
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
    description: 'Types and utilities shared across web and backend',
  },
  {
    iconName: 'Bot' as const,
    title: 'AI-Assisted Development',
    description:
      'Comprehensive CLAUDE.md enables instant onboarding for AI coding assistants',
  },
] as const;

export const techStack = {
  web: {
    title: 'Web',
    items: [
      'Next.js 16',
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
  api: {
    title: 'API',
    items: [
      'Fastify 5',
      'TypeScript',
      'Prisma',
      'PostgreSQL',
      'Better-auth',
      'Zod',
      'Scalar Docs',
      'Helmet',
      'Rate Limiting',
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

export const includedFeatures = [
  {
    iconName: 'Lock' as const,
    title: 'Authentication System',
    pages: [
      { name: 'Sign in', href: '/login' },
      { name: 'Sign up', href: '/signup' },
      { name: 'Forgot password', href: '/forgot-password' },
    ],
  },
  {
    iconName: 'LayoutDashboard' as const,
    title: 'User Dashboard',
    pages: [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Change password', href: '/dashboard/change-password' },
    ],
  },
  {
    iconName: 'ShieldCheck' as const,
    title: 'Admin Dashboard',
    pages: [
      { name: 'System monitoring', href: '/admin' },
      { name: 'User management', href: '/admin/users' },
      { name: 'Audit logs', href: '/admin/audit-logs' },
    ],
  },
] as const;
