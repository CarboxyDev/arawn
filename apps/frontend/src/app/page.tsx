import { type HealthCheck } from '@repo/shared-types';
import { formatDateTime } from '@repo/shared-utils';
import { Activity, ArrowRight, Boxes, Terminal } from 'lucide-react';
import Link from 'next/link';

import { CommandBlock } from '@/components/landing/command-block';
import { FeatureCard } from '@/components/landing/feature-card';
import { Logo } from '@/components/landing/logo';
import { TechBadge } from '@/components/landing/tech-badge';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { features, quickStartCommands, techStack } from '@/config/landing-data';

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
              NestJS, Turborepo and other modern technologies.
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
              <Link href="/examples" className="flex items-center gap-2">
                View Live Examples
              </Link>
            </Button>
          </div>
        </div>

        {health && isLocalDev && (
          <div className="border-border bg-card rounded-lg border p-8">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="text-foreground h-5 w-5" />
                <h2 className="text-card-foreground text-xl font-medium">
                  API Status
                </h2>
              </div>
              <span
                className={`rounded-md px-3 py-1 text-xs font-medium ${
                  health.status === 'ok'
                    ? 'border border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400'
                    : 'border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400'
                }`}
              >
                {health.status === 'ok' ? 'Healthy' : 'Error'}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-8">
              <div>
                <p className="text-muted-foreground mb-2 text-xs">
                  Environment
                </p>
                <p className="text-card-foreground text-base font-medium capitalize">
                  {health.environment}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-2 text-xs">Version</p>
                <p className="text-card-foreground text-base font-medium">
                  {health.version}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-2 text-xs">Uptime</p>
                <p className="text-card-foreground text-base font-medium">
                  {health.uptime}s
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-2 text-xs">
                  Last Checked
                </p>
                <p className="text-card-foreground text-base font-medium">
                  {formatDateTime(health.timestamp)}
                </p>
              </div>
            </div>
          </div>
        )}

        {!health && isLocalDev && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-950">
            <p className="text-center text-sm text-amber-900 dark:text-amber-400">
              Unable to connect to backend API. Make sure the backend is
              running.
            </p>
          </div>
        )}
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
          className="border-border bg-muted rounded-lg border p-8"
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
                <a
                  href="http://localhost:5050"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-border hover:border-foreground/30 hover:bg-accent bg-background inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors"
                >
                  pgAdmin <span className="text-muted-foreground">:5050</span>
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
