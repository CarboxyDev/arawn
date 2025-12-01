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
      'Prisma 7',
      'PostgreSQL',
      'Better-auth',
      'Zod',
      'Scalar Docs',
      'Helmet',
      'Rate Limiting',
      'CORS',
    ],
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
    command: 'pnpm create blitzpack',
    tooltip: 'Creates a new project with all dependencies installed',
  },
  {
    command: 'docker compose up -d',
    tooltip: 'Starts PostgreSQL in the background',
  },
  {
    command: 'pnpm db:migrate',
    tooltip: 'Creates database tables',
  },
  {
    command: 'pnpm dev',
    tooltip: 'Starts web (localhost:3000) and API (localhost:8080)',
  },
];

export const includedFeatures = [
  {
    iconName: 'Lock' as const,
    title: 'Authentication System',
    description:
      'Complete auth with email/password, OAuth, and session management',
  },
  {
    iconName: 'LayoutDashboard' as const,
    title: 'User Dashboard',
    description: 'User dashboard with profile and password management',
  },
  {
    iconName: 'ShieldCheck' as const,
    title: 'Admin Dashboard',
    description: 'System monitoring, user management, and session controls',
  },
  {
    iconName: 'Server' as const,
    title: 'API Infrastructure',
    description:
      'RESTful endpoints, Zod validation, security headers, structured logging, and auto-generated API docs',
  },
  {
    iconName: 'Mail' as const,
    title: 'Email System',
    description:
      'React Email templates with Resend integration for verification, password reset, and transactional emails',
  },
  {
    iconName: 'Wrench' as const,
    title: 'Developer Tooling',
    description:
      'CLI setup wizard, Vitest testing suite, git hooks, and production Docker configuration',
  },
] as const;
