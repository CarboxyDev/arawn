import { Button } from '@repo/packages-ui/button';
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

import { GitHubStarButton } from '@/components/github-star-button';
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
    <main className="bg-background relative flex flex-1 flex-col items-center justify-center p-8">
      <div className="absolute right-8 top-8 flex items-center gap-2">
        <GitHubStarButton />
        <ThemeToggle />
      </div>
      <div className="w-full max-w-5xl space-y-12">
        <div className="space-y-6 text-center">
          <div className="flex justify-center">
            <Logo />
          </div>
          <div className="space-y-4">
            <h1 className="text-foreground text-5xl font-semibold tracking-tight">
              Ship production apps faster
            </h1>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              Production-ready TypeScript monorepo with Next.js, Fastify, and
              Turborepo. Authentication, admin dashboards, API infrastructure,
              and battle-tested features already configured and working out of
              the box.
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
      </div>
    </main>
  );
}
