'use client';

import { motion } from 'framer-motion';
import {
  Hammer,
  InfinityIcon,
  type LucideIcon,
  Rocket,
  Zap,
} from 'lucide-react';
import React from 'react';

interface Differentiator {
  icon: LucideIcon;
  title: string;
  description: string;
}

const DIFFERENTIATORS: Differentiator[] = [
  {
    icon: Hammer,
    title: 'We Made the Hard Choices',
    description:
      'We made the architectural decisions. You get battle-tested patterns for auth, API design, state management, and database queries. No more reinventing the wheel.',
  },
  {
    icon: Zap,
    title: 'No Assembly Required',
    description:
      'Auth flows, email system, admin dashboard, and other core features are already wired up and ready to use. No more wasting time setting up from scratch.',
  },
  {
    icon: Rocket,
    title: 'Truly Production-Ready',
    description:
      'Auth flows, rate limiting, structured logging, testing infrastructure and more are configured for production from day one.',
  },
  {
    icon: InfinityIcon,
    title: 'Built for Zero Friction',
    description:
      'Unified tooling, shared packages and full TypeScript support ensures that all components work seamlessly together.',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      duration: 0.4,
    },
  },
};

interface DifferentiatorCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

function DifferentiatorCard({
  icon: Icon,
  title,
  description,
}: DifferentiatorCardProps) {
  return (
    <motion.div
      variants={item}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="bg-card/50 border-border hover:border-primary/20 group relative overflow-hidden rounded-xl border p-6 backdrop-blur-sm transition-all lg:p-8"
      style={{
        filter: 'drop-shadow(0 0 0px transparent)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.filter =
          'drop-shadow(0 0 20px hsl(var(--primary) / 0.15))';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.filter = 'drop-shadow(0 0 0px transparent)';
      }}
    >
      <div className="space-y-4">
        <div className="bg-primary/10 text-primary group-hover:bg-primary/20 flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="text-foreground text-xl font-semibold leading-tight lg:text-2xl">
          {title}
        </h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

export function WhySection(): React.ReactElement {
  return (
    <div className="space-y-12">
      <div className="text-center">
        <h2 className="text-foreground mb-4 text-3xl font-semibold tracking-tight lg:text-5xl">
          Why Blitzpack?
        </h2>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed">
          This is not your average template. It's a production-ready template
          with core features already wired up and ready to use.
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-100px' }}
        className="grid gap-6 md:grid-cols-2 lg:gap-8"
      >
        {DIFFERENTIATORS.map((diff) => (
          <DifferentiatorCard
            key={diff.title}
            icon={diff.icon}
            title={diff.title}
            description={diff.description}
          />
        ))}
      </motion.div>
    </div>
  );
}
