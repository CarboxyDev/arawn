'use client';

import { ExampleForm } from '@/components/examples/example-form';
import { ExampleJotai } from '@/components/examples/example-jotai';
import { ExampleQuery } from '@/components/examples/example-query';
import { ThemeToggle } from '@/components/examples/theme-toggle';
import { Separator } from '@/components/ui/separator';

export default function ExamplePage() {
  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Arawn Examples</h1>
          <p className="text-muted-foreground mt-2">
            Showcasing shadcn/ui, React Query, Jotai, and React Hook Form
          </p>
        </div>
        <ThemeToggle />
      </div>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">React Hook Form + Zod</h2>
        <ExampleForm />
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">TanStack Query</h2>
        <ExampleQuery />
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Jotai State Management</h2>
        <ExampleJotai />
      </section>
    </div>
  );
}
