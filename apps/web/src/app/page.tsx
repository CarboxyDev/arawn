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
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Code2,
  Copy,
  Database,
  ExternalLink,
  FileCode,
  KeyRound,
  LayoutDashboard,
  Loader2,
  type LucideIcon,
  Package,
  ShieldCheck,
  UserPlus,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

import { Logo } from '@/components/logo';
import { env } from '@/lib/env';
import { cn } from '@/lib/utils';

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

const NEXT_STEPS = [
  {
    icon: LayoutDashboard,
    title: 'Explore Pre-built Pages',
    description: 'Check out the admin panel and authentication pages.',
    links: [{ label: 'Quick Links', href: '/#quick-links' }],
  },
  {
    icon: FileCode,
    title: 'Check API Documentation',
    description: 'View auto-generated OpenAPI docs for all API endpoints.',
    links: [
      {
        label: 'API Docs',
        href: `${getBaseApiUrl()}/docs`,
        external: true,
      },
    ],
  },
  {
    icon: Code2,
    title: 'Replace This Page',
    description: 'Build your own landing page to match your product.',
    links: [{ label: 'apps/web/src/app/page.tsx', href: '#', isPath: true }],
  },
  {
    icon: Database,
    title: 'Customize Your Schema',
    description: 'Edit your database schema and run migrations.',
    links: [
      {
        label: 'apps/api/prisma/schema.prisma',
        href: '#',
        isPath: true,
      },
    ],
  },

  {
    icon: UserPlus,
    title: 'Enable Social Login Providers',
    description:
      'Enable OAuth providers by adding your client IDs and secrets to the env file.',
    links: [{ label: '.env.local', href: '#', isPath: true }],
  },
  {
    icon: Zap,
    title: 'Enable Email Service',
    description:
      'Optionally, add your Resend API key and update sender email to the env file.',
    links: [{ label: 'Resend', href: 'https://resend.com/', external: true }],
  },
] as const;

const COMMON_COMMANDS = [
  { command: 'pnpm dev', description: 'Start all dev servers' },
  { command: 'pnpm test', description: 'Run all tests' },
  { command: 'pnpm typecheck', description: 'Check types' },
  { command: 'pnpm build', description: 'Build for production' },
] as const;

const QUICK_LINKS = [
  {
    title: 'API Documentation',
    description: 'Interactive OpenAPI documentation',
    href: `${getBaseApiUrl()}/docs`,
    icon: FileCode,
    external: true,
    disabled: false,
  },
  {
    title: 'Dashboard',
    description: 'View your user dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    external: false,
    disabled: false,
  },
  {
    title: 'Admin Panel',
    description: 'System monitoring and user management',
    href: '/admin',
    icon: ShieldCheck,
    external: false,
    disabled: false,
  },
  {
    title: 'Sign In',
    description: 'Access your account',
    href: '/login',
    icon: KeyRound,
    external: false,
    disabled: false,
  },
  {
    title: 'Sign Up',
    description: 'Create a new account',
    href: '/signup',
    icon: UserPlus,
    external: false,
    disabled: false,
  },
  {
    title: 'Database Studio',
    description: 'Run pnpm db:studio to open',
    href: '#',
    icon: Database,
    external: false,
    disabled: true,
  },
] as const;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
    },
  },
};

function StatusIndicator({
  label,
  isOk,
  isLoading,
}: {
  label: string;
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
              Connected
            </span>
          </>
        ) : (
          <>
            <span className="relative flex h-2 w-2 rounded-full bg-red-500"></span>
            <span className="text-xs font-medium text-red-600 dark:text-red-400">
              Disconnected
            </span>
          </>
        )}
      </div>
    </div>
  );
}

function NextStepCard({
  icon: Icon,
  title,
  description,
  links,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  links: readonly {
    label: string;
    href: string;
    external?: boolean;
    isPath?: boolean;
  }[];
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
      className="bg-card border-border hover:border-primary/30 group relative flex h-full flex-col overflow-hidden rounded-xl border p-6 transition-all"
      style={{
        filter: 'drop-shadow(0 0 0px transparent)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.filter =
          'drop-shadow(0 0 12px hsl(var(--primary) / 0.1))';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.filter = 'drop-shadow(0 0 0px transparent)';
      }}
    >
      <div className="flex flex-col space-y-4">
        <div className="bg-primary/10 text-primary group-hover:bg-primary/15 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all duration-300">
          <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
        </div>
        <div className="space-y-2">
          <h3 className="text-foreground text-base font-semibold leading-tight">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {links.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              className={cn(
                'text-primary hover:text-primary/80 inline-flex items-center gap-1 text-sm font-medium transition-colors',
                link.isPath && 'font-mono text-xs'
              )}
            >
              {link.label}
              {link.external && <ExternalLink className="h-3 w-3" />}
            </a>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function CommandBlock({
  command,
  description,
}: {
  command: string;
  description: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-muted/50 hover:bg-muted group flex items-center justify-between rounded-lg border px-4 py-3 transition-colors">
      <div className="flex flex-col gap-1">
        <code className="text-foreground font-mono text-sm font-medium">
          {command}
        </code>
        <span className="text-muted-foreground text-xs">{description}</span>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleCopy}
        className="hover:bg-background/80 shrink-0"
      >
        {copied ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

export default function Home() {
  const { data: health, isLoading, error } = useHealthCheck();

  const isDatabaseConnected = health?.database === 'connected';
  const isApiHealthy = health?.status === 'ok';
  const hasError = !!error;

  return (
    <main className="bg-background relative flex flex-1 flex-col">
      <div className="absolute right-8 top-8 z-10 flex items-center gap-2">
        <ThemeToggle />
      </div>

      <section className="w-full px-4 pb-12 pt-16 sm:px-6 md:px-8 lg:pt-20">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 text-center"
          >
            <div className="flex justify-center">
              <Logo className="h-20 w-auto" />
            </div>
            <div className="space-y-4">
              <h1 className="text-foreground text-4xl font-bold tracking-tight lg:text-5xl">
                Welcome to Blitzpack
              </h1>
              <p className="text-muted-foreground mx-auto max-w-2xl text-base leading-relaxed lg:text-lg">
                Your production-ready full-stack application is up and running.
                Authentication, database, API infrastructure, and more are all
                configured and ready to customize.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="w-full px-4 py-12 sm:px-6 md:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-6 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-xl">System Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-muted/50 space-y-3 rounded-lg border p-4">
                    <StatusIndicator
                      label="API Server"
                      isOk={!hasError && isApiHealthy}
                      isLoading={isLoading}
                    />
                    <div className="border-border h-px w-full border-t" />
                    <StatusIndicator
                      label="Database"
                      isOk={!hasError && isDatabaseConnected}
                      isLoading={isLoading}
                    />
                    <div className="border-border h-px w-full border-t" />
                    <StatusIndicator
                      label="Web Server"
                      isOk={true}
                      isLoading={false}
                    />
                  </div>
                  {hasError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-destructive/10 border-destructive/30 rounded-lg border p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="bg-destructive/20 text-destructive flex h-8 w-8 shrink-0 items-center justify-center rounded-md">
                          <ExternalLink className="h-4 w-4" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-destructive text-sm font-medium">
                            API Server Offline
                          </p>
                          <p className="text-destructive/80 text-xs">
                            Run{' '}
                            <code className="bg-destructive/15 rounded px-1.5 py-0.5 font-mono">
                              pnpm dev
                            </code>{' '}
                            to start all services
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              id="quick-links"
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-xl">Quick Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {QUICK_LINKS.filter((link) => !link.disabled).map(
                      (link, idx) => {
                        const Icon = link.icon;
                        return (
                          <motion.a
                            key={link.href}
                            href={link.href}
                            {...(link.external && {
                              target: '_blank',
                              rel: 'noopener noreferrer',
                            })}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + idx * 0.05 }}
                            whileHover={{ x: 4 }}
                            className="hover:border-primary/30 hover:bg-primary/5 group/link flex items-center gap-4 rounded-lg border bg-transparent p-3.5 transition-all"
                          >
                            <div className="bg-primary/10 text-primary group-hover/link:bg-primary group-hover/link:text-primary-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-foreground mb-0.5 text-sm font-semibold">
                                {link.title}
                              </div>
                              <p className="text-muted-foreground line-clamp-1 text-xs">
                                {link.description}
                              </p>
                            </div>
                            {link.external && (
                              <div className="text-muted-foreground group-hover/link:text-primary opacity-0 transition-all group-hover/link:opacity-100">
                                <ExternalLink className="h-4 w-4" />
                              </div>
                            )}
                          </motion.a>
                        );
                      }
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="w-full px-4 py-12 sm:px-6 md:px-8">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="text-center">
            <h2 className="text-foreground mb-3 text-2xl font-semibold tracking-tight lg:text-3xl">
              Next Steps
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-base leading-relaxed">
              Here's what you can do now to make this project your own.
            </p>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            className="grid auto-rows-fr grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {NEXT_STEPS.map((step) => (
              <motion.div key={step.title} variants={item}>
                <NextStepCard
                  icon={step.icon}
                  title={step.title}
                  description={step.description}
                  links={step.links}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="w-full px-4 py-12 sm:px-6 md:px-8">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="text-center">
            <h2 className="text-foreground mb-3 text-2xl font-semibold tracking-tight lg:text-3xl">
              Common Commands
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-base leading-relaxed">
              Here are the commands you'll use frequently during development.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl"
          >
            <Card>
              <CardContent className="space-y-2 p-6">
                {COMMON_COMMANDS.map((cmd) => (
                  <CommandBlock
                    key={cmd.command}
                    command={cmd.command}
                    description={cmd.description}
                  />
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <section className="w-full px-4 py-12 sm:px-6 md:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="border-border bg-card rounded-lg border p-6">
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="space-y-2">
                <h3 className="text-foreground text-lg font-medium">
                  Ready to Build?
                </h3>
                <p className="text-muted-foreground text-sm">
                  Remove this page and start building your application. Check
                  out the documentation for more guidance.
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
              <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
                <Package className="h-3.5 w-3.5" />
                <span>Built with</span>
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
        </div>
      </section>
    </main>
  );
}
