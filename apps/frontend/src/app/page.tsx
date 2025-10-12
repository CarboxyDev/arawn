import { type HealthCheck } from '@repo/shared-types';
import { formatDateTime } from '@repo/shared-utils';
import {
  Activity,
  ArrowRight,
  Bot,
  Github,
  PackageOpen,
  Rocket,
  Shield,
  Terminal,
  Workflow,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';
import { isDevelopment } from '@/lib/env';

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

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const backendPort = new URL(apiUrl).port || '8080';
  const frontendPort = process.env.PORT || '3000';

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-white p-8">
      <Button asChild variant="secondary" className="absolute right-8 top-8">
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
      <div className="w-full max-w-5xl space-y-12">
        <div className="space-y-3 text-center">
          <h1 className="text-6xl font-semibold tracking-tight text-gray-900">
            Arawn
          </h1>
          <p className="text-lg text-gray-500">
            Production-ready TypeScript monorepo template
          </p>
        </div>

        {health && isDevelopment() && (
          <div className="rounded-lg border border-gray-200 p-8">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-gray-700" />
                <h2 className="text-xl font-medium text-gray-900">
                  API Status
                </h2>
              </div>
              <span
                className={`rounded-md px-3 py-1 text-xs font-medium ${
                  health.status === 'ok'
                    ? 'border border-green-200 bg-green-50 text-green-700'
                    : 'border border-red-200 bg-red-50 text-red-700'
                }`}
              >
                {health.status === 'ok' ? 'Healthy' : 'Error'}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-8">
              <div>
                <p className="mb-2 text-xs text-gray-500">Environment</p>
                <p className="text-base font-medium capitalize text-gray-900">
                  {health.environment}
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs text-gray-500">Version</p>
                <p className="text-base font-medium text-gray-900">
                  {health.version}
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs text-gray-500">Uptime</p>
                <p className="text-base font-medium text-gray-900">
                  {health.uptime}s
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs text-gray-500">Last Checked</p>
                <p className="text-base font-medium text-gray-900">
                  {formatDateTime(health.timestamp)}
                </p>
              </div>
            </div>
          </div>
        )}

        {!health && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
            <p className="text-center text-sm text-amber-900">
              Unable to connect to backend API. Make sure the backend is
              running.
            </p>
          </div>
        )}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 p-6">
            <Rocket className="mb-3 h-5 w-5 text-gray-700" />
            <h3 className="mb-2 text-base font-medium text-gray-900">
              Production Ready
            </h3>
            <p className="text-sm leading-relaxed text-gray-500">
              Helmet security, rate limiting, CORS, and validated environment
              configs
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-6">
            <Zap className="mb-3 h-5 w-5 text-gray-700" />
            <h3 className="mb-2 text-base font-medium text-gray-900">
              Fast Development
            </h3>
            <p className="text-sm leading-relaxed text-gray-500">
              Turborepo for optimized builds and pnpm for efficient package
              management
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-6">
            <Shield className="mb-3 h-5 w-5 text-gray-700" />
            <h3 className="mb-2 text-base font-medium text-gray-900">
              Type Safe
            </h3>
            <p className="text-sm leading-relaxed text-gray-500">
              Zod schemas with TypeScript for runtime and compile-time safety
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-6">
            <Workflow className="mb-3 h-5 w-5 text-gray-700" />
            <h3 className="mb-2 text-base font-medium text-gray-900">
              Database Ready
            </h3>
            <p className="text-sm leading-relaxed text-gray-500">
              Prisma ORM with PostgreSQL, migrations, and Docker setup included
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-6">
            <PackageOpen className="mb-3 h-5 w-5 text-gray-700" />
            <h3 className="mb-2 text-base font-medium text-gray-900">
              Shared Packages
            </h3>
            <p className="text-sm leading-relaxed text-gray-500">
              Types, utilities, and config shared across frontend and backend
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-6">
            <Bot className="mb-3 h-5 w-5 text-gray-700" />
            <h3 className="mb-2 text-base font-medium text-gray-900">
              AI-Assisted Development
            </h3>
            <p className="text-sm leading-relaxed text-gray-500">
              Comprehensive CLAUDE.md enables instant onboarding for AI coding
              assistants
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 p-8">
          <h2 className="mb-8 text-xl font-medium text-gray-900">Tech Stack</h2>
          <div className="grid gap-x-12 gap-y-8 md:grid-cols-2">
            <div>
              <h3 className="mb-4 text-sm font-medium text-gray-900">
                Frontend
              </h3>
              <ul className="space-y-2.5 text-sm text-gray-600">
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
              <h3 className="mb-4 text-sm font-medium text-gray-900">
                Backend
              </h3>
              <ul className="space-y-2.5 text-sm text-gray-600">
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
              <h3 className="mb-4 text-sm font-medium text-gray-900">
                Shared Packages
              </h3>
              <ul className="space-y-2.5 text-sm text-gray-600">
                <li>Zod Schemas</li>
                <li>Utility Functions</li>
                <li>Environment Config (dotenv-flow)</li>
                <li>Type Definitions</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-medium text-gray-900">DevOps</h3>
              <ul className="space-y-2.5 text-sm text-gray-600">
                <li>Turborepo</li>
                <li>pnpm Workspaces</li>
                <li>ESLint 9 + Prettier</li>
                <li>Husky + lint-staged</li>
                <li>CLAUDE.md (AI Context)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8">
          <div className="mb-6 flex items-center gap-3">
            <Terminal className="h-5 w-5 text-gray-700" />
            <h2 className="text-xl font-medium text-gray-900">Quick Start</h2>
          </div>
          <div className="space-y-3 font-mono text-sm">
            <div className="rounded-md border border-gray-200 bg-white px-4 py-3 text-gray-700">
              <span className="text-gray-400">$</span> pnpm install
            </div>
            <div className="rounded-md border border-gray-200 bg-white px-4 py-3 text-gray-700">
              <span className="text-gray-400">$</span> docker-compose up -d
            </div>
            <div className="rounded-md border border-gray-200 bg-white px-4 py-3 text-gray-700">
              <span className="text-gray-400">$</span> cp
              apps/frontend/.env.local.example apps/frontend/.env.local
            </div>
            <div className="rounded-md border border-gray-200 bg-white px-4 py-3 text-gray-700">
              <span className="text-gray-400">$</span> cp
              apps/backend/.env.local.example apps/backend/.env.local
            </div>
            <div className="rounded-md border border-gray-200 bg-white px-4 py-3 text-gray-700">
              <span className="text-gray-400">$</span> cd apps/backend && pnpm
              db:migrate
            </div>
            <div className="rounded-md border border-gray-200 bg-white px-4 py-3 text-gray-700">
              <span className="text-gray-400">$</span> pnpm dev
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-500">
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
