import { type HealthCheck } from '@repo/shared-types';
import { formatDateTime } from '@repo/shared-utils';
import {
  Activity,
  ArrowRight,
  PackageOpen,
  Shield,
  Terminal,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

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

  // Extract ports from configuration
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const backendPort = new URL(apiUrl).port || '8080';
  const frontendPort = process.env.PORT || '3000';

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-white">
      <div className="max-w-5xl w-full space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-6xl font-semibold tracking-tight text-gray-900">
            Arawn
          </h1>
          <p className="text-gray-500 text-lg">
            Production-ready TypeScript monorepo template
          </p>
        </div>

        {/* Health Status */}
        {health && (
          <div className="border border-gray-200 rounded-lg p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-gray-700" />
                <h2 className="text-xl font-medium text-gray-900">
                  API Status
                </h2>
              </div>
              <span
                className={`px-3 py-1 rounded-md text-xs font-medium ${
                  health.status === 'ok'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {health.status === 'ok' ? 'Healthy' : 'Error'}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-8">
              <div>
                <p className="text-xs text-gray-500 mb-2">Environment</p>
                <p className="text-base font-medium text-gray-900 capitalize">
                  {health.environment}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">Version</p>
                <p className="text-base font-medium text-gray-900">
                  {health.version}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">Uptime</p>
                <p className="text-base font-medium text-gray-900">
                  {health.uptime}s
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">Last Checked</p>
                <p className="text-base font-medium text-gray-900">
                  {formatDateTime(health.timestamp)}
                </p>
              </div>
            </div>
          </div>
        )}

        {!health && (
          <div className="bg-amber-50 rounded-lg p-6 border border-amber-200">
            <p className="text-amber-900 text-center text-sm">
              Unable to connect to backend API. Make sure the backend is
              running.
            </p>
          </div>
        )}

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded-lg p-6">
            <PackageOpen className="w-5 h-5 text-gray-700 mb-3" />
            <h3 className="text-base font-medium mb-2 text-gray-900">
              Shared Packages
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Types, utilities, and config shared across frontend and backend
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-6">
            <Zap className="w-5 h-5 text-gray-700 mb-3" />
            <h3 className="text-base font-medium mb-2 text-gray-900">
              Fast Development
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Turborepo for optimized builds and pnpm for efficient package
              management
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-6">
            <Shield className="w-5 h-5 text-gray-700 mb-3" />
            <h3 className="text-base font-medium mb-2 text-gray-900">
              Type Safe
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Zod schemas with TypeScript for runtime and compile-time safety
            </p>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="border border-gray-200 rounded-lg p-8">
          <h2 className="text-xl font-medium mb-8 text-gray-900">Tech Stack</h2>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
            <div>
              <h3 className="font-medium text-gray-900 mb-4 text-sm">
                Frontend
              </h3>
              <ul className="space-y-2.5 text-gray-600 text-sm">
                <li>Next.js 15 (App Router)</li>
                <li>React 19</li>
                <li>TypeScript 5</li>
                <li>Tailwind CSS 4</li>
                <li>shadcn/ui</li>
                <li>TanStack Query</li>
                <li>Jotai</li>
                <li>React Hook Form</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-4 text-sm">
                Backend
              </h3>
              <ul className="space-y-2.5 text-gray-600 text-sm">
                <li>NestJS 11</li>
                <li>Express</li>
                <li>TypeScript 5</li>
                <li>Zod 4 (Validation)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-4 text-sm">
                Shared Packages
              </h3>
              <ul className="space-y-2.5 text-gray-600 text-sm">
                <li>Zod Schemas</li>
                <li>Utility Functions</li>
                <li>Environment Config (dotenv-flow)</li>
                <li>Type Definitions</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-4 text-sm">DevOps</h3>
              <ul className="space-y-2.5 text-gray-600 text-sm">
                <li>Turborepo</li>
                <li>pnpm Workspaces</li>
                <li>ESLint 9 + Prettier</li>
                <li>Husky + lint-staged</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Start */}
        <div className="bg-gray-50 rounded-lg p-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <Terminal className="w-5 h-5 text-gray-700" />
            <h2 className="text-xl font-medium text-gray-900">Quick Start</h2>
          </div>
          <div className="space-y-3 text-sm font-mono">
            <div className="bg-white rounded-md px-4 py-3 text-gray-700 border border-gray-200">
              <span className="text-gray-400">$</span> pnpm install
            </div>
            <div className="bg-white rounded-md px-4 py-3 text-gray-700 border border-gray-200">
              <span className="text-gray-400">$</span> pnpm dev
            </div>
          </div>
          <p className="text-gray-500 text-xs mt-4">
            Frontend runs on port {frontendPort}, backend on port {backendPort}
          </p>
        </div>

        {/* Examples Link */}
        <div className="flex justify-center">
          <Button asChild size="lg" variant="outline" className="group">
            <Link href="/example" className="flex items-center gap-2">
              View Examples
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
