import { Button } from '@repo/packages-ui/button';
import { GitHubIcon } from '@repo/packages-ui/icons/brand-icons';
import { ThemeToggle } from '@repo/packages-ui/theme-toggle';
import { ArrowRight, Boxes, PackageCheck, Terminal } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { CommandBlock } from '@/components/landing/command-block';
import { FeatureCard } from '@/components/landing/feature-card';
import { IncludedFeatureCard } from '@/components/landing/included-feature-card';
import { Logo } from '@/components/landing/logo';
import { TechBadge } from '@/components/landing/tech-badge';
import {
  features,
  includedFeatures,
  quickStartCommands,
  techStack,
} from '@/config/landing-data';
import { siteConfig } from '@/config/site';

export default async function Home(): Promise<React.ReactElement> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const isLocalDev =
    apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1');

  const backendPort = new URL(apiUrl).port || '8080';

  return (
    <main className="bg-background relative flex flex-1 flex-col items-center justify-center p-8 pb-0">
      <div className="absolute right-8 top-8 flex items-center gap-2">
        <Button asChild variant="default">
          <Link href="/login">Sign In</Link>
        </Button>
        <ThemeToggle />
      </div>
      <div className="w-full max-w-5xl space-y-12">
        <div className="space-y-6 text-center">
          <div className="flex justify-center">
            <Logo />
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
                  Web <span className="text-muted-foreground">:3000</span>
                </a>
                <a
                  href={`http://localhost:${backendPort}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-border hover:border-foreground/30 hover:bg-accent bg-background inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors"
                >
                  API{' '}
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
            </>
          )}
        </div>
      </div>
    </main>
  );
}
