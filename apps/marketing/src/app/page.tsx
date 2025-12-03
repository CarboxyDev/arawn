import { ThemeToggle } from '@repo/packages-ui/theme-toggle';
import { Boxes, PackageCheck, Terminal } from 'lucide-react';
import React from 'react';

import { GitHubStarButton } from '@/components/github-star-button';
import { CommandBlock } from '@/components/landing/command-block';
import { FAQSection } from '@/components/landing/faq-section';
import { FeatureCard } from '@/components/landing/feature-card';
import { Footer } from '@/components/landing/footer';
import { HeroSection } from '@/components/landing/hero-section';
import { IncludedFeatureCard } from '@/components/landing/included-feature-card';
import { SectionContainer } from '@/components/landing/section-container';
import { TechBadge } from '@/components/landing/tech-badge';
import { WhySection } from '@/components/landing/why-section';

const CORE_FEATURES = [
  {
    iconName: 'Rocket' as const,
    title: 'Production-Ready Infrastructure',
    description:
      'Security headers, rate limiting, CORS, and CI/CD configured. Deploy with confidence, not configuration.',
  },
  {
    iconName: 'Zap' as const,
    title: 'Lightning-Fast Development',
    description:
      'Turborepo caching and pnpm workspaces mean changes rebuild in milliseconds, not minutes.',
  },
  {
    iconName: 'Shield' as const,
    title: 'Type-Safe Across the Stack',
    description:
      'Zod schemas validate once, protect everywhere. From API requests to database queries to UI forms.',
  },
  {
    iconName: 'Code2' as const,
    title: 'Modern UI Out of the Box',
    description:
      'Beautiful, accessible components with shadcn/ui, Tailwind v4, dark mode, and smooth animations.',
  },
  {
    iconName: 'Workflow' as const,
    title: 'Database Without the Headaches',
    description:
      'Prisma ORM with PostgreSQL, migrations handled, and Docker setup that just works.',
  },
  {
    iconName: 'Lock' as const,
    title: 'Authentication That Works',
    description:
      'Complete auth flow with email/password, OAuth, and session management. Not just a login form.',
  },
  {
    iconName: 'TestTube' as const,
    title: 'Ship with Confidence',
    description:
      'Comprehensive testing with Vitest. Unit and integration tests across all packages.',
  },
  {
    iconName: 'PackageOpen' as const,
    title: 'Code Reuse Made Easy',
    description:
      'Shared types and utilities across web and backend. Define once, use everywhere.',
  },
  {
    iconName: 'Bot' as const,
    title: 'AI Pair Programming Ready',
    description:
      'CLAUDE.md documentation enables instant context for AI assistants. Your AI copilot understands the architecture.',
  },
] as const;

const INCLUDED_FEATURES = [
  {
    iconName: 'Lock' as const,
    title: 'Authentication System',
    description:
      'Not just a login form—full auth flow with email verification, password reset, OAuth, and session management.',
    features: [
      'Email & password authentication',
      'Google & GitHub OAuth ready',
      'Session management with refresh',
      'Email verification flow',
      'Password reset system',
    ],
  },
  {
    iconName: 'LayoutDashboard' as const,
    title: 'User Dashboard',
    description:
      'Complete user portal with profile management and account settings.',
    features: [
      'Profile editing',
      'Password change',
      'Session management',
      'Account preferences',
    ],
  },
  {
    iconName: 'ShieldCheck' as const,
    title: 'Admin Dashboard',
    description:
      'Full control panel for system monitoring and user management.',
    features: [
      'Real-time metrics',
      'User management',
      'Session controls',
      'Ban/unban users',
      'System health monitoring',
    ],
  },
  {
    iconName: 'Server' as const,
    title: 'API Infrastructure',
    description:
      'Production-grade REST API with everything you need before going live.',
    features: [
      'RESTful endpoints',
      'Zod validation',
      'Security headers',
      'Structured logging',
      'Auto-generated API docs',
      'Rate limiting',
    ],
  },
  {
    iconName: 'Mail' as const,
    title: 'Email System',
    description:
      'Beautiful transactional emails with React Email and Resend integration.',
    features: [
      'Email verification',
      'Password reset',
      'Welcome emails',
      'React Email templates',
      'Resend API integration',
    ],
  },
  {
    iconName: 'Wrench' as const,
    title: 'Developer Tooling',
    description:
      'Everything you need for a smooth development and deployment experience.',
    features: [
      'CLI setup wizard',
      'Vitest testing suite',
      'Git hooks (Husky)',
      'Production Docker',
      'CI/CD with GitHub Actions',
    ],
  },
] as const;

const TECH_STACK = {
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

const QUICK_START_STEPS: Array<{
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

export default function Home() {
  return (
    <main className="bg-background relative flex min-h-screen flex-col">
      <div className="absolute right-8 top-8 z-10 flex items-center gap-2 lg:fixed">
        <GitHubStarButton />
        <ThemeToggle />
      </div>
      <SectionContainer className="pt-28">
        <HeroSection />
      </SectionContainer>

      <SectionContainer variant="card">
        <WhySection />
      </SectionContainer>

      <SectionContainer>
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-foreground mb-4 text-3xl font-semibold tracking-tight lg:text-4xl">
              Features
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              Everything you need to build and ship production apps
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {CORE_FEATURES.map((feature) => (
              <FeatureCard
                key={feature.title}
                iconName={feature.iconName}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </SectionContainer>

      <SectionContainer variant="card">
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-foreground mb-4 flex items-center justify-center gap-3 text-3xl font-semibold tracking-tight lg:text-4xl">
              <PackageCheck className="h-8 w-8" />
              <span>What's Included</span>
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              Production-ready features configured and working out of the box
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {INCLUDED_FEATURES.map((feature) => (
              <IncludedFeatureCard
                key={feature.title}
                iconName={feature.iconName}
                title={feature.title}
                description={feature.description}
                features={feature.features}
              />
            ))}
          </div>
        </div>
      </SectionContainer>

      <SectionContainer id="quick-start">
        <div className="border-border bg-card border-l-primary rounded-lg border border-l-8 p-8 lg:p-12">
          <div className="mb-8 flex items-center gap-3">
            <Terminal className="text-foreground h-6 w-6" />
            <h2 className="text-foreground text-2xl font-semibold lg:text-3xl">
              Quick Start
            </h2>
          </div>
          <div className="space-y-3">
            {QUICK_START_STEPS.map((cmd, index) => (
              <CommandBlock
                key={cmd.command}
                command={cmd.command}
                tooltipContent={cmd.tooltip}
                step={index + 1}
              />
            ))}
          </div>
          <div className="border-border mt-8 border-t pt-6">
            <h3 className="text-foreground mb-4 text-sm font-medium">
              What happens next?
            </h3>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Web app runs on localhost:3000</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>API runs on localhost:8080</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>API docs available at localhost:8080/docs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Start building your features and ship!</span>
              </li>
            </ul>
          </div>
        </div>
      </SectionContainer>

      <SectionContainer variant="card">
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-foreground mb-4 flex items-center justify-center gap-3 text-3xl font-semibold tracking-tight lg:text-4xl">
              <Boxes className="h-8 w-8" />
              <span>Tech Stack</span>
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              Built on modern, battle-tested technologies
            </p>
          </div>
          <div className="space-y-8">
            {Object.values(TECH_STACK).map((stack) => (
              <div key={stack.title}>
                <h3 className="text-foreground mb-4 text-sm font-medium uppercase tracking-wide">
                  {stack.title}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {stack.items.map((item) => (
                    <TechBadge key={item}>{item}</TechBadge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionContainer>
      <SectionContainer>
        <FAQSection />
      </SectionContainer>
      <Footer />
    </main>
  );
}
