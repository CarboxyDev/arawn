import { type HealthCheck } from '@repo/shared-types';
import { formatDateTime } from '@repo/shared-utils';
import {
  Activity,
  ArrowRight,
  Bot,
  Code2,
  GitBranch,
  Github,
  PackageOpen,
  Rocket,
  Shield,
  Terminal,
  TestTube,
  Workflow,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import { Button } from '@/components/ui/button';
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
  const frontendPort = process.env.PORT || '3000';

  return (
    <main className="bg-background relative flex min-h-screen flex-col items-center justify-center p-8">
      <div className="absolute right-8 top-8 flex items-center gap-2">
        <Button asChild variant="default">
          <a
            href={siteConfig.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
        </Button>
        <AnimatedThemeToggler className="border-input bg-background hover:bg-accent hover:text-accent-foreground flex h-9 w-9 items-center justify-center rounded-md border text-sm transition-colors" />
      </div>
      <div className="w-full max-w-5xl space-y-12">
        <div className="space-y-3 text-center">
          <h1 className="text-foreground text-6xl font-semibold tracking-tight">
            Arawn
          </h1>
          <p className="text-muted-foreground text-lg">
            Production-ready TypeScript monorepo template
          </p>
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
          <div className="border-border bg-card rounded-lg border p-6">
            <Rocket className="text-foreground mb-3 h-5 w-5" />
            <h3 className="text-card-foreground mb-2 text-base font-medium">
              Production Ready
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Helmet security, rate limiting, CORS, and validated environment
              configs
            </p>
          </div>
          <div className="border-border bg-card rounded-lg border p-6">
            <Zap className="text-foreground mb-3 h-5 w-5" />
            <h3 className="text-card-foreground mb-2 text-base font-medium">
              Fast Development
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Turborepo for optimized builds and pnpm for efficient package
              management
            </p>
          </div>
          <div className="border-border bg-card rounded-lg border p-6">
            <Shield className="text-foreground mb-3 h-5 w-5" />
            <h3 className="text-card-foreground mb-2 text-base font-medium">
              Type Safe
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Zod schemas with TypeScript for runtime and compile-time safety
            </p>
          </div>
          <div className="border-border bg-card rounded-lg border p-6">
            <Workflow className="text-foreground mb-3 h-5 w-5" />
            <h3 className="text-card-foreground mb-2 text-base font-medium">
              Database Ready
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Prisma ORM with PostgreSQL, migrations, and Docker setup included
            </p>
          </div>
          <div className="border-border bg-card rounded-lg border p-6">
            <Code2 className="text-foreground mb-3 h-5 w-5" />
            <h3 className="text-card-foreground mb-2 text-base font-medium">
              Modern UI Components
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              shadcn/ui with Radix primitives, Tailwind v4, dark mode, and
              Framer Motion
            </p>
          </div>
          <div className="border-border bg-card rounded-lg border p-6">
            <TestTube className="text-foreground mb-3 h-5 w-5" />
            <h3 className="text-card-foreground mb-2 text-base font-medium">
              Comprehensive Testing
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Vitest for unit and integration tests with coverage reports across
              all packages
            </p>
          </div>
          <div className="border-border bg-card rounded-lg border p-6">
            <PackageOpen className="text-foreground mb-3 h-5 w-5" />
            <h3 className="text-card-foreground mb-2 text-base font-medium">
              Shared Packages
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Types, utilities, and config shared across frontend and backend
            </p>
          </div>
          <div className="border-border bg-card rounded-lg border p-6">
            <GitBranch className="text-foreground mb-3 h-5 w-5" />
            <h3 className="text-card-foreground mb-2 text-base font-medium">
              CI/CD Ready
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              GitHub Actions workflow with automated testing, type checking, and
              linting
            </p>
          </div>
          <div className="border-border bg-card rounded-lg border p-6">
            <Bot className="text-foreground mb-3 h-5 w-5" />
            <h3 className="text-card-foreground mb-2 text-base font-medium">
              AI-Assisted Development
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Comprehensive CLAUDE.md enables instant onboarding for AI coding
              assistants
            </p>
          </div>
        </div>

        <div className="border-border bg-card rounded-lg border p-8">
          <h2 className="text-card-foreground mb-8 text-xl font-medium">
            Tech Stack
          </h2>
          <div className="grid gap-x-12 gap-y-8 md:grid-cols-2">
            <div>
              <h3 className="text-card-foreground mb-4 text-sm font-medium">
                Frontend
              </h3>
              <ul className="text-muted-foreground space-y-2.5 text-sm">
                <li>Next.js 15 (App Router)</li>
                <li>React 19</li>
                <li>TypeScript 5</li>
                <li>Tailwind CSS v4</li>
                <li>shadcn/ui + Radix UI</li>
                <li>TanStack Query v5</li>
                <li>Jotai</li>
                <li>React Hook Form + Zod</li>
                <li>Framer Motion</li>
                <li>Sonner (Toasts)</li>
                <li>next-themes (Dark mode)</li>
              </ul>
            </div>
            <div>
              <h3 className="text-card-foreground mb-4 text-sm font-medium">
                Backend
              </h3>
              <ul className="text-muted-foreground space-y-2.5 text-sm">
                <li>NestJS 11</li>
                <li>TypeScript 5</li>
                <li>Prisma 6 (ORM)</li>
                <li>PostgreSQL 17</li>
                <li>Zod v4 (Validation)</li>
                <li>Swagger + Scalar (API Docs)</li>
                <li>Helmet (Security)</li>
                <li>Rate Limiting (@nestjs/throttler)</li>
                <li>CORS</li>
              </ul>
            </div>
            <div>
              <h3 className="text-card-foreground mb-4 text-sm font-medium">
                Shared Packages
              </h3>
              <ul className="text-muted-foreground space-y-2.5 text-sm">
                <li>Zod Schemas</li>
                <li>Utility Functions</li>
                <li>Environment Config (dotenv-flow)</li>
                <li>Type Definitions</li>
              </ul>
            </div>
            <div>
              <h3 className="text-card-foreground mb-4 text-sm font-medium">
                DevOps
              </h3>
              <ul className="text-muted-foreground space-y-2.5 text-sm">
                <li>Turborepo</li>
                <li>pnpm Workspaces</li>
                <li>Vitest (Testing)</li>
                <li>GitHub Actions CI</li>
                <li>ESLint 9 + Prettier</li>
                <li>Husky + lint-staged</li>
                <li>CLAUDE.md (AI Context)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-border bg-muted rounded-lg border p-8">
          <div className="mb-6 flex items-center gap-3">
            <Terminal className="text-foreground h-5 w-5" />
            <h2 className="text-foreground text-xl font-medium">Quick Start</h2>
          </div>
          <div className="space-y-3 font-mono text-sm">
            <div className="border-border bg-card text-card-foreground rounded-md border px-4 py-3">
              <span className="text-muted-foreground">$</span> pnpm install
            </div>
            <div className="border-border bg-card text-card-foreground rounded-md border px-4 py-3">
              <span className="text-muted-foreground">$</span> docker-compose up
              -d
            </div>
            <div className="border-border bg-card text-card-foreground rounded-md border px-4 py-3">
              <span className="text-muted-foreground">$</span> cp
              apps/frontend/.env.local.example apps/frontend/.env.local
            </div>
            <div className="border-border bg-card text-card-foreground rounded-md border px-4 py-3">
              <span className="text-muted-foreground">$</span> cp
              apps/backend/.env.local.example apps/backend/.env.local
            </div>
            <div className="border-border bg-card text-card-foreground rounded-md border px-4 py-3">
              <span className="text-muted-foreground">$</span> cd apps/backend
              && pnpm db:migrate
            </div>
            <div className="border-border bg-card text-card-foreground rounded-md border px-4 py-3">
              <span className="text-muted-foreground">$</span> pnpm dev
            </div>
          </div>
          <p className="text-muted-foreground mt-4 text-xs">
            Frontend: localhost:{frontendPort} • Backend: localhost:
            {backendPort} • API Docs: localhost:{backendPort}/docs
          </p>
        </div>

        <div className="flex justify-center">
          <Button asChild size="lg" variant="outline" className="group">
            <Link href="/example" className="flex items-center gap-2">
              View Examples
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
