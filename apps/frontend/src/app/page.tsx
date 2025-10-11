import { type HealthCheck } from '@repo/shared-types';
import { formatDateTime } from '@repo/shared-utils';

async function getHealth(): Promise<HealthCheck | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Arawn Monorepo
          </h1>
          <p className="text-gray-600 text-lg">
            Production-ready TypeScript monorepo template
          </p>
        </div>

        {/* Health Status */}
        {health && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                API Health Status
              </h2>
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  health.status === 'ok'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {health.status === 'ok' ? '✓ Healthy' : '✗ Error'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Environment</p>
                <p className="text-lg font-medium text-gray-900 capitalize">
                  {health.environment}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Version</p>
                <p className="text-lg font-medium text-gray-900">
                  {health.version}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Uptime</p>
                <p className="text-lg font-medium text-gray-900">
                  {health.uptime}s
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Last Checked</p>
                <p className="text-lg font-medium text-gray-900">
                  {formatDateTime(health.timestamp)}
                </p>
              </div>
            </div>
          </div>
        )}

        {!health && (
          <div className="bg-yellow-50 rounded-2xl shadow-lg p-8 border border-yellow-200">
            <p className="text-yellow-800 text-center">
              ⚠️ Unable to connect to backend API. Make sure the backend is
              running.
            </p>
          </div>
        )}

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
            <div className="text-3xl mb-3">📦</div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">
              Shared Packages
            </h3>
            <p className="text-gray-600 text-sm">
              Types, utilities, and config shared across frontend and backend
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">
              Fast Development
            </h3>
            <p className="text-gray-600 text-sm">
              Turborepo for optimized builds and pnpm for efficient package
              management
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">
              Type Safe
            </h3>
            <p className="text-gray-600 text-sm">
              Zod schemas with TypeScript for runtime and compile-time safety
            </p>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            Tech Stack
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-3">Frontend</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>• Next.js 15 (App Router)</li>
                <li>• React 19</li>
                <li>• TypeScript</li>
                <li>• Tailwind CSS</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-3">Backend</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>• NestJS</li>
                <li>• Express</li>
                <li>• TypeScript</li>
                <li>• Zod Validation</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-3">Shared</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>• Zod Schemas</li>
                <li>• Utility Functions</li>
                <li>• Environment Config</li>
                <li>• Type Definitions</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-3">DevOps</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>• Turborepo</li>
                <li>• pnpm Workspaces</li>
                <li>• ESLint + Prettier</li>
                <li>• Husky Pre-commit</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Start */}
        <div className="bg-gray-900 rounded-2xl shadow-lg p-8 border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4 text-white">
            Quick Start
          </h2>
          <div className="space-y-3 text-sm font-mono">
            <div className="bg-gray-800 rounded p-3 text-gray-300">
              <span className="text-green-400">$</span> pnpm install
            </div>
            <div className="bg-gray-800 rounded p-3 text-gray-300">
              <span className="text-green-400">$</span> pnpm dev
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-4">
            Frontend runs on port 3001, backend on configured PORT
          </p>
        </div>
      </div>
    </main>
  );
}
