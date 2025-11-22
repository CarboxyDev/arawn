import { type HealthCheck } from '@repo/packages-types';
import { ArrowRight, Boxes, PackageCheck, Terminal } from 'lucide-react';
import Link from 'next/link';

import { GitHubIcon } from '@/components/icons/brand-icons';
import { CommandBlock } from '@/components/landing/command-block';
import { FeatureCard } from '@/components/landing/feature-card';
import { IncludedFeatureCard } from '@/components/landing/included-feature-card';
import { Logo } from '@/components/landing/logo';
import { TechBadge } from '@/components/landing/tech-badge';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import {
  features,
  includedFeatures,
  quickStartCommands,
  techStack,
} from '@/config/landing-data';
import { siteConfig } from '@/config/site';

async function getHealth(): Promise<HealthCheck | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const res = await fetch(`${apiUrl}/health`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function Home() {
  const health = await getHealth();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const isLocalDev =
    apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1');

  const backendPort = new URL(apiUrl).port || '8080';

  return (
    <main className="bg-background relative flex flex-1 flex-col items-center justify-center p-8 pb-0">
      <PageHeader />
      <div className="w-full max-w-5xl space-y-12">
        <div className="space-y-6 text-center">
          <div className="flex justify-center">
            <Logo className="h-20 w-auto" />
          </div>
          <div className="space-y-3">
            <h1 className="text-foreground text-5xl font-semibold tracking-tight">
              Ship production apps faster
            </h1>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              Production-ready full-stack TypeScript monorepo with Next.js,
              Fastify, Turborepo and other modern technologies.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              asChild
              size="lg"
              className="group shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            >
              <Link href="#quick-start" className="flex items-center gap-2">
                Quick Start
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="group transition-all hover:scale-105"
            >
              <a
                href={siteConfig.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <GitHubIcon className="size-4" />
                GitHub
              </a>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              iconName={feature.iconName}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>

        <div className="border-border bg-card rounded-lg border p-8">
          <h2 className="text-card-foreground mb-8 flex items-center gap-2 text-xl font-medium">
            <PackageCheck className="text-foreground h-5 w-5" />
            <span>Out of the Box</span>
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {includedFeatures.map((feature) => (
              <IncludedFeatureCard
                key={feature.title}
                iconName={feature.iconName}
                title={feature.title}
                pages={feature.pages}
              />
            ))}
          </div>
        </div>

        <div className="border-border bg-card rounded-lg border p-8">
          <h2 className="text-card-foreground mb-8 flex items-center gap-2 text-xl font-medium">
            <Boxes className="text-foreground h-5 w-5" />
            <span>Tech Stack</span>
          </h2>
          <div className="space-y-8">
            {Object.values(techStack).map((stack) => (
              <div key={stack.title}>
                <h3 className="text-card-foreground mb-4 text-sm font-medium">
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

        <div
          id="quick-start"
          className="border-border bg-card border-l-primary rounded-lg border border-l-8 p-8"
        >
          <div className="mb-6 flex items-center gap-3">
            <Terminal className="text-foreground h-5 w-5" />
            <h2 className="text-foreground text-xl font-medium">Quick Start</h2>
          </div>
          <div className="space-y-3">
            {quickStartCommands.map((cmd) => (
              <CommandBlock
                key={cmd.command}
                command={cmd.command}
                tooltipContent={cmd.tooltip}
              />
            ))}
          </div>
          {isLocalDev && (
            <>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <span className="text-muted-foreground text-xs">Services:</span>
                <a
                  href="http://localhost:3000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-border hover:border-foreground/30 hover:bg-accent bg-background inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors"
                >
                  Frontend <span className="text-muted-foreground">:3000</span>
                </a>
                <a
                  href={`http://localhost:${backendPort}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-border hover:border-foreground/30 hover:bg-accent bg-background inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors"
                >
                  Backend{' '}
                  <span className="text-muted-foreground">:{backendPort}</span>
                </a>
                <a
                  href={`http://localhost:${backendPort}/docs`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-border hover:border-foreground/30 hover:bg-accent bg-background inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors"
                >
                  API Docs
                  <span className="text-muted-foreground">
                    :{backendPort}/docs
                  </span>
                </a>
              </div>
              <p className="text-muted-foreground mt-4 text-center text-xs">
                See{' '}
                <code className="bg-muted rounded px-1.5 py-0.5 font-mono">
                  GETTING_STARTED.md
                </code>
                for further optional customization.
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
