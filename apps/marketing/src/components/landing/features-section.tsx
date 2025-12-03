'use client';

import { motion } from 'framer-motion';
import {
  Bot,
  CloudUpload,
  Code2,
  Database,
  type LucideIcon,
  PackageOpen,
  ShieldCheck,
  ShieldPlus,
  TestTube,
  Zap,
} from 'lucide-react';
import React from 'react';

const CORE_FEATURES = [
  {
    icon: ShieldPlus,
    title: 'Full-Stack Type Safety',
    description:
      'Zod schemas validate once, protect everywhere. From API requests to database queries to UI forms.',
  },
  {
    icon: Zap,
    title: 'Lightning-Fast Dev',
    description:
      'Turborepo supercharges your development workflow with blazing fast rebuilds.',
  },
  {
    icon: CloudUpload,
    title: 'Deployment Ready',
    description:
      'Blitzpack comes with a production-ready deployment infrastructure already configured.',
  },
  {
    icon: Code2,
    title: 'Modern UI Out of the Box',
    description:
      'Beautiful components with shadcn/ui, Tailwind v4, dark/light mode, and smooth animations.',
  },
  {
    icon: Database,
    title: 'Hassle-Free Database',
    description:
      'Prisma ORM with PostgreSQL, easy migrations and Docker setup that just works.',
  },
  {
    icon: ShieldCheck,
    title: 'Authentication Made Easy',
    description:
      'Complete frontend and API auth flows with email/password, OAuth, and session management.',
  },
  {
    icon: TestTube,
    title: 'Ship with Confidence',
    description:
      'Comprehensive testing with Vitest. Blitzpack comes with a testing infrastructure built in.',
  },
  {
    icon: PackageOpen,
    title: 'Monorepo Ready',
    description:
      'Shared packages across all apps thanks to the monorepo structure.',
  },
  {
    icon: Bot,
    title: 'AI Agent Ready',
    description:
      'The bundled CLAUDE.md enables instant context for AI assistants.',
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

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
      className="bg-card border-border hover:border-primary/30 group relative flex h-full flex-col overflow-hidden rounded-xl border p-6 transition-all lg:p-7"
      style={{
        filter: 'drop-shadow(0 0 0px transparent)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.filter =
          'drop-shadow(0 0 16px hsl(var(--primary) / 0.12))';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.filter = 'drop-shadow(0 0 0px transparent)';
      }}
    >
      <div className="flex flex-col space-y-3.5">
        <div className="bg-primary/10 text-primary group-hover:bg-primary/15 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-all duration-300">
          <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
        </div>
        <h3 className="text-foreground text-lg font-semibold leading-tight">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

export function FeaturesSection() {
  return (
    <div className="space-y-12">
      <div className="text-center">
        <h2 className="text-foreground mb-4 text-3xl font-semibold tracking-tight lg:text-5xl">
          Built for Real Projects
        </h2>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed">
          Not just boilerplate. Blitzpack offers a complete foundation with the
          infrastructure and patterns you need to build production-grade
          applications
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-100px' }}
        className="grid auto-rows-fr gap-6 md:grid-cols-3 lg:gap-8"
      >
        {CORE_FEATURES.map((feature) => (
          <motion.div key={feature.title} variants={item} className="flex">
            <FeatureCard
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
