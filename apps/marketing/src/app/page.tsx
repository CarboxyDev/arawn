import { ThemeToggle } from '@repo/packages-ui/theme-toggle';
import { Boxes, Terminal } from 'lucide-react';
import React from 'react';

import { GitHubStarButton } from '@/components/github-star-button';
import { CommandBlock } from '@/components/landing/command-block';
import { FAQSection } from '@/components/landing/faq-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { Footer } from '@/components/landing/footer';
import { HeroSection } from '@/components/landing/hero-section';
import { IncludedSection } from '@/components/landing/included-section';
import { SectionContainer } from '@/components/landing/section-container';
import { TechBadge } from '@/components/landing/tech-badge';
import { WhySection } from '@/components/landing/why-section';

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
        <FeaturesSection />
      </SectionContainer>

      <SectionContainer variant="card">
        <IncludedSection />
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
