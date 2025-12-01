'use client';

import { Button } from '@repo/packages-ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/packages-ui/card';
import { GitHubIcon } from '@repo/packages-ui/icons/brand-icons';
import { ThemeToggle } from '@repo/packages-ui/theme-toggle';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  KeyRound,
  LayoutDashboard,
  Loader2,
  Settings,
  ShieldCheck,
  UserPlus,
  XCircle,
  Zap,
} from 'lucide-react';

import { Logo } from '@/components/logo';
import { env } from '@/lib/env';

interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  database: 'connected' | 'disconnected';
}

function getBaseApiUrl(): string {
  const apiUrl = env.apiUrl;
  return apiUrl.replace(/\/api\/?$/, '');
}

function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const baseUrl = getBaseApiUrl();
      const response = await fetch(`${baseUrl}/health`);
      if (!response.ok) {
        throw new Error('Health check failed');
      }
      return response.json() as Promise<HealthResponse>;
    },
    refetchInterval: 30000,
    retry: 1,
  });
}

function StatusRow({
  label,
  value,
  isOk,
  isLoading,
}: {
  label: string;
  value: { ok: string; error: string };
  isOk: boolean;
  isLoading: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-muted-foreground text-sm">{label}</span>
      <div className="flex items-center gap-2">
        {isLoading ? (
          <>
            <Loader2 className="text-muted-foreground h-3.5 w-3.5 animate-spin" />
            <span className="text-muted-foreground text-xs">Checking...</span>
          </>
        ) : isOk ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {value.ok}
            </span>
          </>
        ) : (
          <>
            <span className="relative flex h-2 w-2 rounded-full bg-red-500"></span>
            <span className="text-xs font-medium text-red-600 dark:text-red-400">
              {value.error}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

function ChecklistItem({
  label,
  checked,
  isLoading,
}: {
  label: string;
  checked: boolean;
  isLoading: boolean;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      {isLoading ? (
        <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
      ) : checked ? (
        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
      ) : (
        <XCircle className="text-destructive h-5 w-5" />
      )}
      <span
        className={`text-sm ${isLoading ? 'text-muted-foreground' : checked ? 'text-foreground' : 'text-muted-foreground'}`}
      >
        {label}
      </span>
    </div>
  );
}

const quickLinks = [
  {
    title: 'Dashboard',
    description: 'View your user dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Admin Panel',
    description: 'System monitoring and user management',
    href: '/admin',
    icon: ShieldCheck,
  },
  {
    title: 'Sign In',
    description: 'Access your account',
    href: '/login',
    icon: KeyRound,
  },
  {
    title: 'Sign Up',
    description: 'Create a new account',
    href: '/signup',
    icon: UserPlus,
  },
];

export default function Home() {
  const { data: health, isLoading, error } = useHealthCheck();

  const isDatabaseConnected = health?.database === 'connected';
  const isApiHealthy = health?.status === 'ok';
  const hasError = !!error;

  return (
    <main className="bg-background relative flex flex-1 flex-col items-center p-8">
      <div className="absolute right-8 top-8 flex items-center gap-2">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-4xl space-y-8 pt-8">
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <Logo className="h-20 w-auto" />
          </div>
          <div className="space-y-3">
            <h1 className="text-foreground text-4xl font-semibold tracking-tight">
              Your Project is Ready
            </h1>
            <p className="text-muted-foreground mx-auto max-w-xl text-base">
              Everything is set up and ready to go. Start building your
              application with the features below.
            </p>
            <div className="text-muted-foreground flex items-center justify-center gap-1.5 pt-1 text-sm">
              <Zap className="h-3.5 w-3.5" />
              <span>Powered by</span>
              <a
                href="https://github.com/CarboxyDev/blitzpack"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground font-medium underline-offset-4 hover:underline"
              >
                Blitzpack
              </a>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings className="h-4 w-4" />
                Setup Checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <ChecklistItem
                label="API server running"
                checked={isApiHealthy && !hasError}
                isLoading={isLoading}
              />
              <ChecklistItem
                label="Database connected"
                checked={isDatabaseConnected}
                isLoading={isLoading}
              />
              <ChecklistItem
                label="Environment configured"
                checked={!hasError}
                isLoading={isLoading}
              />
              {hasError && (
                <p className="text-destructive mt-2 text-xs">
                  Make sure your API server is running on the correct port.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <StatusRow
                label="API Server"
                value={{ ok: 'Healthy', error: 'Unhealthy' }}
                isOk={!hasError && isApiHealthy}
                isLoading={isLoading}
              />
              <StatusRow
                label="Database"
                value={{ ok: 'Connected', error: 'Disconnected' }}
                isOk={!hasError && isDatabaseConnected}
                isLoading={isLoading}
              />
              {hasError && (
                <p className="text-destructive mt-2 text-xs">
                  Make sure your API server is running on the correct port.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-foreground text-lg font-medium">Quick Links</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className="border-border bg-card hover:bg-accent group rounded-lg border p-4 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <Icon className="text-muted-foreground group-hover:text-foreground h-5 w-5 transition-colors" />
                    <ArrowRight className="text-muted-foreground h-4 w-4 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                  </div>
                  <h3 className="text-foreground mt-3 font-medium">
                    {link.title}
                  </h3>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {link.description}
                  </p>
                </a>
              );
            })}
          </div>
        </div>

        <div className="border-border bg-card rounded-lg border p-6">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="space-y-2">
              <h3 className="text-foreground text-lg font-medium">
                Need help getting started?
              </h3>
              <p className="text-muted-foreground text-sm">
                Check out the Blitzpack documentation for guides, API reference,
                and best practices.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button asChild variant="outline">
                <a
                  href="https://github.com/CarboxyDev/blitzpack"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <GitHubIcon className="h-4 w-4" />
                  View on GitHub
                </a>
              </Button>
              <Button asChild>
                <a
                  href="https://github.com/CarboxyDev/blitzpack#readme"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Read Documentation
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
