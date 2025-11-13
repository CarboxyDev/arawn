'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Code2, Database, Flame } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { ExampleForm } from '@/components/examples/example-form';
import { ExampleJotai } from '@/components/examples/example-jotai';
import { ExampleQuery } from '@/components/examples/example-query';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

type Tab = 'forms' | 'data' | 'state';

const tabs = [
  {
    id: 'forms' as const,
    label: 'Forms & Validation',
    shortLabel: 'Forms',
    icon: Code2,
  },
  {
    id: 'data' as const,
    label: 'Data Fetching',
    shortLabel: 'Data',
    icon: Database,
  },
  {
    id: 'state' as const,
    label: 'State Management',
    shortLabel: 'State',
    icon: Flame,
  },
];

export default function ExamplesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('forms');

  return (
    <div className="bg-background relative min-h-screen">
      <PageHeader />

      <div className="container mx-auto px-8 py-12">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                Home
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="text-sm font-medium">Examples</span>
            </div>
            <h1 className="text-foreground text-5xl font-semibold tracking-tight">
              Live Examples
            </h1>
            <p className="text-muted-foreground max-w-2xl text-lg">
              Explore working examples showcasing the full-stack capabilities of
              this monorepo template. Each example demonstrates production-ready
              patterns and best practices.
            </p>
          </div>

          <div className="w-full space-y-8">
            <div className="bg-secondary/50 flex gap-1.5 rounded-xl p-1.5">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'relative flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-200',
                      isActive
                        ? 'text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-tab"
                        className="bg-primary absolute inset-0 rounded-lg shadow-lg"
                        transition={{
                          type: 'spring',
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                    )}
                    <Icon className="relative z-10 h-4 w-4" />
                    <span className="relative z-10 hidden sm:inline">
                      {tab.label}
                    </span>
                    <span className="relative z-10 sm:hidden">
                      {tab.shortLabel}
                    </span>
                  </button>
                );
              })}
            </div>

            {activeTab === 'forms' && (
              <motion.div
                key="forms"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <h2 className="text-foreground text-2xl font-semibold">
                    React Hook Form + Zod
                  </h2>
                  <p className="text-muted-foreground">
                    Type-safe form validation with React Hook Form and Zod
                    schemas. Features real-time validation, error messages, and
                    seamless integration with shadcn/ui components.
                  </p>
                  <div className="bg-muted/50 rounded-md border p-4">
                    <p className="text-sm font-medium">Key Features:</p>
                    <ul className="text-muted-foreground mt-2 space-y-1 text-sm">
                      <li>✓ Runtime validation with Zod schemas</li>
                      <li>✓ Type-safe form values inferred from schemas</li>
                      <li>✓ Accessible form components from shadcn/ui</li>
                      <li>✓ Real-time validation feedback</li>
                    </ul>
                  </div>
                </div>
                <div className="border-border bg-card rounded-lg border p-8">
                  <ExampleForm />
                </div>
              </motion.div>
            )}

            {activeTab === 'data' && (
              <motion.div
                key="data"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <h2 className="text-foreground text-2xl font-semibold">
                    TanStack Query
                  </h2>
                  <p className="text-muted-foreground">
                    Powerful data synchronization with TanStack Query (React
                    Query). Automatic caching, background refetching, optimistic
                    updates, and loading states.
                  </p>
                  <div className="bg-muted/50 rounded-md border p-4">
                    <p className="text-sm font-medium">Key Features:</p>
                    <ul className="text-muted-foreground mt-2 space-y-1 text-sm">
                      <li>✓ Automatic caching and background refetching</li>
                      <li>✓ Query invalidation after mutations</li>
                      <li>✓ Loading and error states handled gracefully</li>
                      <li>✓ Optimistic updates for better UX</li>
                    </ul>
                  </div>
                </div>
                <div className="border-border bg-card rounded-lg border p-8">
                  <ExampleQuery />
                </div>
              </motion.div>
            )}

            {activeTab === 'state' && (
              <motion.div
                key="state"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <h2 className="text-foreground text-2xl font-semibold">
                    Jotai State Management
                  </h2>
                  <p className="text-muted-foreground">
                    Primitive and flexible state management with Jotai. Atomic
                    state updates, minimal boilerplate, and seamless TypeScript
                    integration for global client-side state.
                  </p>
                  <div className="bg-muted/50 rounded-md border p-4">
                    <p className="text-sm font-medium">Key Features:</p>
                    <ul className="text-muted-foreground mt-2 space-y-1 text-sm">
                      <li>✓ Atomic state management with minimal API</li>
                      <li>✓ No need for context providers or reducers</li>
                      <li>✓ TypeScript-first with excellent type inference</li>
                      <li>✓ Works great alongside TanStack Query</li>
                    </ul>
                  </div>
                </div>
                <div className="border-border bg-card rounded-lg border p-8">
                  <ExampleJotai />
                </div>
              </motion.div>
            )}
          </div>

          <div className="bg-muted/30 mt-12 rounded-xl border p-8">
            <div className="flex flex-col items-center text-center">
              <h3 className="text-foreground mb-3 text-2xl font-semibold">
                Ready to Build?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl">
                These examples are just the beginning. This template includes
                everything you need for production: Fastify backend with Prisma
                ORM, PostgreSQL database, Scalar API docs, comprehensive
                testing, and more.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button asChild size="lg">
                  <a
                    href={siteConfig.github}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on GitHub
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    const currentIndex = tabs.findIndex(
                      (tab) => tab.id === activeTab
                    );
                    const nextIndex = (currentIndex + 1) % tabs.length;
                    setActiveTab(tabs[nextIndex].id);
                  }}
                  className="group"
                >
                  Check Another Example
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
