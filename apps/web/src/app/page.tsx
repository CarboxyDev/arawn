'use client';

import { Badge } from '@repo/packages-ui/badge';
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
  ArrowRight,
  CheckCircle2,
  Database,
  ExternalLink,
  KeyRound,
  LayoutDashboard,
  Loader2,
  Settings,
  ShieldCheck,
  UserPlus,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';

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

function StatusIndicator({
  status,
  isLoading,
}: {
  status: 'ok' | 'error' | undefined;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
        <span className="text-muted-foreground text-sm">Checking...</span>
      </div>
    );
  }

  if (status === 'ok') {
    return (
      <div className="flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
        </span>
        <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
          All systems operational
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-3 w-3">
        <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
      </span>
      <span className="text-sm font-medium text-red-600 dark:text-red-400">
        Connection issues
      </span>
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
        className={`text-sm ${checked ? 'text-foreground' : 'text-muted-foreground'}`}
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
    requiresAuth: true,
  },
  {
    title: 'Admin Panel',
    description: 'System monitoring and user management',
    href: '/admin',
    icon: ShieldCheck,
    requiresAuth: true,
  },
  {
    title: 'Sign In',
    description: 'Access your account',
    href: '/login',
    icon: KeyRound,
    requiresAuth: false,
  },
  {
    title: 'Sign Up',
    description: 'Create a new account',
    href: '/signup',
    icon: UserPlus,
    requiresAuth: false,
  },
];

export default function Home(): React.ReactElement {
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
          <div className="space-y-2">
            <h1 className="text-foreground text-4xl font-semibold tracking-tight">
              Welcome to Your Project
            </h1>
            <p className="text-muted-foreground mx-auto max-w-xl text-lg">
              Your development environment is ready. Explore the features below
              to get started.
            </p>
          </div>
          <div className="flex justify-center pt-2">
            <StatusIndicator
              status={hasError ? 'error' : health?.status}
              isLoading={isLoading}
            />
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
                <Database className="h-4 w-4" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    API Status
                  </span>
                  <Badge variant={isApiHealthy ? 'default' : 'destructive'}>
                    {isLoading
                      ? 'Checking...'
                      : isApiHealthy
                        ? 'Healthy'
                        : 'Unhealthy'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    Database
                  </span>
                  <Badge
                    variant={isDatabaseConnected ? 'default' : 'destructive'}
                  >
                    {isLoading
                      ? 'Checking...'
                      : isDatabaseConnected
                        ? 'Connected'
                        : 'Disconnected'}
                  </Badge>
                </div>
                {health?.timestamp && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      Last Check
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {new Date(health.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-foreground text-lg font-medium">Quick Links</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
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
                </Link>
              );
            })}
          </div>
        </div>

        <Card className="border-border/50 bg-card/50">
          <CardContent className="py-6">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
              <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-lg">
                <ExternalLink className="text-muted-foreground h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-foreground font-medium">
                  Built with Blitzpack
                </h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  This project was scaffolded with Blitzpack. Check out the
                  documentation for guides, API reference, and more.
                </p>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <a
                    href="https://github.com/CarboxyDev/blitzpack"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <GitHubIcon className="h-4 w-4" />
                    GitHub
                  </a>
                </Button>
                <Button asChild size="sm">
                  <a
                    href="https://github.com/CarboxyDev/blitzpack#readme"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Docs
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
