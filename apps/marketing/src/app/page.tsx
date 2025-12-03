import { ThemeToggle } from '@repo/packages-ui/theme-toggle';
import { Boxes } from 'lucide-react';
import React from 'react';

import { GitHubStarButton } from '@/components/github-star-button';
import { FAQSection } from '@/components/landing/faq-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { Footer } from '@/components/landing/footer';
import { HeroSection } from '@/components/landing/hero-section';
import { IncludedSection } from '@/components/landing/included-section';
import { QuickStartSection } from '@/components/landing/quick-start-section';
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
        <QuickStartSection />
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
