'use client';

import { motion } from 'framer-motion';
import { Boxes } from 'lucide-react';
import React from 'react';

const TECH_STACK = {
  frontend: {
    title: 'Frontend',
    items: [
      'Next.js 16',
      'React 19',
      'TypeScript',
      'Tailwind CSS v4',
      'shadcn/ui',
      'Radix UI',
      'TanStack Query',
      'TanStack Table',
      'Zod',
      'Jotai',
      'React Hook Form',
      'Framer Motion',
      'Recharts',
      'Sonner',
      'next-themes',
    ],
  },
  api: {
    title: 'API',
    items: [
      'Fastify 5',
      'TypeScript',
      'Prisma 7',
      'PostgreSQL',
      'Better-auth',
      'Zod',
      'Pino',
      'React Email',
      'Scalar',
    ],
  },
  devOps: {
    title: 'DevOps',
    items: [
      'Turborepo',
      'pnpm Workspaces',
      'Vitest',
      'GitHub Actions CI',
      'ESLint',
      'Prettier',
      'Husky',
    ],
  },
} as const;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
    },
  },
};

interface TechBadgeProps {
  children: React.ReactNode;
}

function TechBadge({ children }: TechBadgeProps) {
  return (
    <motion.span
      variants={badgeVariants}
      className="border-border/60 hover:border-primary/50 text-foreground inline-flex items-center rounded-lg border bg-transparent px-3.5 py-2 text-sm font-medium transition-all duration-300"
      style={{
        filter: 'drop-shadow(0 0 0px transparent)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.filter =
          'drop-shadow(0 0 8px hsl(var(--primary) / 0.2))';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.filter = 'drop-shadow(0 0 0px transparent)';
      }}
      whileHover={{ y: -2 }}
    >
      {children}
    </motion.span>
  );
}

interface StackCategoryProps {
  title: string;
  items: readonly string[];
}

function StackCategory({ title, items }: StackCategoryProps) {
  return (
    <motion.div variants={item} className="space-y-4">
      <h3 className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
        {title}
      </h3>
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="flex flex-wrap gap-2.5"
      >
        {items.map((item) => (
          <TechBadge key={item}>{item}</TechBadge>
        ))}
      </motion.div>
    </motion.div>
  );
}

export function TechStackSection() {
  return (
    <div className="space-y-12">
      <div className="text-center">
        <h2 className="text-foreground mb-4 flex items-center justify-center gap-3 text-3xl font-semibold tracking-tight lg:text-5xl">
          <Boxes className="h-8 w-8 lg:h-9 lg:w-9" />
          <span>Tech Stack</span>
        </h2>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed">
          Built on modern, battle-tested technologies
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-100px' }}
        className="space-y-10"
      >
        {Object.values(TECH_STACK).map((stack) => (
          <StackCategory
            key={stack.title}
            title={stack.title}
            items={stack.items}
          />
        ))}
      </motion.div>
    </div>
  );
}
