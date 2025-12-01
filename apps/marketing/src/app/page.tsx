import { Button } from '@repo/packages-ui/button';
import { GitHubIcon } from '@repo/packages-ui/icons/brand-icons';
import { ThemeToggle } from '@repo/packages-ui/theme-toggle';
import {
  ArrowRight,
  Boxes,
  ExternalLink,
  PackageCheck,
  Terminal,
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { CommandBlock } from '@/components/landing/command-block';
import { FeatureCard } from '@/components/landing/feature-card';
import { IncludedFeatureCard } from '@/components/landing/included-feature-card';
import { TechBadge } from '@/components/landing/tech-badge';
import { Logo } from '@/components/logo';
import {
  features,
  includedFeatures,
  quickStartCommands,
  techStack,
} from '@/config/landing-data';
import { siteConfig } from '@/config/site';

export default function Home(): React.ReactElement {
  return (
    <main className="bg-background relative flex flex-1 flex-col items-center justify-center p-8 pb-0">
      <div className="absolute right-8 top-8 flex items-center gap-2">
        <Button asChild variant="default">
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
                href={siteConfig.docs}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="size-4" />
                Documentation
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
                description={feature.description}
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
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href={siteConfig.github}
              target="_blank"
              rel="noopener noreferrer"
              className="border-border hover:border-foreground/30 hover:bg-accent bg-background inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors"
            >
              <GitHubIcon className="h-4 w-4" />
              View on GitHub
            </a>
            <a
              href={siteConfig.docs}
              target="_blank"
              rel="noopener noreferrer"
              className="border-border hover:border-foreground/30 hover:bg-accent bg-background inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Read the Docs
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
