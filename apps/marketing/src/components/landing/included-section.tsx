'use client';

import { motion } from 'framer-motion';
import {
  Check,
  type LucideIcon,
  Mail,
  Server,
  ShieldCheck,
  UserCog,
  Wrench,
} from 'lucide-react';
import React from 'react';

import { cn } from '@/lib/utils';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  highlights: string[];
  featured?: boolean;
}

const FEATURES: Feature[] = [
  {
    icon: ShieldCheck,
    title: 'Complete Authentication System',
    description:
      'Production-ready auth powered by Better Auth. Blitzpack comes with a secure and intuitive authentication system out of the box.',
    highlights: [
      'Login and Signup flows',
      'Email verification & password reset flows',
      'Google and GitHub OAuth providers ready',
      'Session management with refresh',
      'Intuitive role-based access control',
    ],
    featured: true,
  },
  {
    icon: Server,
    title: 'Robust API Infrastructure',
    description:
      'Battle-tested REST API with Fastify. Blitzpack ships with everything you could possibly need to accelerate your development.',
    highlights: [
      'Zod validation everywhere',
      'Structured logging with Pino',
      'Rate limiting built-in',
      'Interactive API documentation with Scalar',
      'Comprehensive testing infrastructure',
    ],
    featured: true,
  },
  {
    icon: UserCog,
    title: 'Admin Dashboard',
    description:
      'Complete admin dashboard with real-time system monitoring, user management, and session controls.',
    highlights: [
      'Live metrics & analytics',
      'User CRUD operations',
      'Session management',
      'Easily extendable',
    ],
  },
  {
    icon: Mail,
    title: 'Email System',
    description:
      'Beautiful transactional emails with React Email and Resend integration ready to use with ease.',
    highlights: [
      'React Email templates',
      'Verification & reset emails',
      'Welcome & notification emails',
      'Resend API integration',
    ],
  },
  {
    icon: Wrench,
    title: 'Developer Tooling',
    description:
      'Blitzpack ships with everything you need to for a smooth development workflow.',
    highlights: [
      'CLI setup wizard',
      'Vitest testing suite',
      'Git hooks & GitHub Actions CI',
      'ESLint and Prettier configured',
      'Docker setup',
    ],
  },
];

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
      duration: 0.5,
    },
  },
};

interface FeatureCardProps {
  feature: Feature;
}

function FeatureCard({ feature }: FeatureCardProps) {
  const { icon: Icon, title, description, highlights, featured } = feature;

  return (
    <motion.div
      variants={item}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'bg-card border-border hover:border-primary/30 group relative flex flex-col overflow-hidden rounded-xl border transition-all',
        featured
          ? 'col-span-full p-8 md:col-span-3 lg:col-span-3 lg:p-10'
          : 'col-span-full p-6 md:col-span-3 lg:col-span-2 lg:p-7'
      )}
      style={{
        filter: 'drop-shadow(0 0 0px transparent)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.filter = featured
          ? 'drop-shadow(0 0 24px hsl(var(--primary) / 0.15))'
          : 'drop-shadow(0 0 16px hsl(var(--primary) / 0.12))';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.filter = 'drop-shadow(0 0 0px transparent)';
      }}
    >
      <div className="flex flex-col space-y-4">
        <div
          className={cn(
            'bg-primary/10 text-primary group-hover:bg-primary/15 flex shrink-0 items-center justify-center rounded-lg transition-all duration-300',
            featured ? 'h-14 w-14' : 'h-12 w-12'
          )}
        >
          <Icon
            className={cn(
              'transition-transform group-hover:scale-110',
              featured ? 'h-7 w-7' : 'h-6 w-6'
            )}
          />
        </div>

        <div className="space-y-2">
          <h3
            className={cn(
              'text-foreground font-semibold leading-tight',
              featured ? 'text-xl lg:text-2xl' : 'text-lg'
            )}
          >
            {title}
          </h3>
          <p
            className={cn(
              'text-muted-foreground leading-relaxed',
              featured ? 'text-base' : 'text-sm'
            )}
          >
            {description}
          </p>
        </div>

        <ul className="border-border space-y-2.5 border-t pt-4">
          {highlights.map((highlight, index) => (
            <motion.li
              key={highlight}
              initial={{ x: 0 }}
              whileHover={{ x: 4 }}
              transition={{ delay: index * 0.03, duration: 0.2 }}
              className="flex items-start gap-2.5"
            >
              <motion.div
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.2, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <Check
                  className={cn(
                    'text-primary flex-shrink-0',
                    featured ? 'mt-0.5 h-5 w-5' : 'mt-0.5 h-4 w-4'
                  )}
                />
              </motion.div>
              <span
                className={cn(
                  'text-muted-foreground',
                  featured ? 'text-sm' : 'text-sm'
                )}
              >
                {highlight}
              </span>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

export function IncludedSection() {
  return (
    <div className="space-y-12">
      <div className="text-center">
        <h2 className="text-foreground mb-4 text-3xl font-semibold tracking-tight lg:text-5xl">
          What's Included
        </h2>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed">
          Production-ready features configured and working out of the box. No
          assembly required.
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-100px' }}
        className="grid auto-rows-fr gap-6 md:grid-cols-3 lg:grid-cols-6 lg:gap-8"
      >
        {FEATURES.map((feature) => (
          <FeatureCard key={feature.title} feature={feature} />
        ))}
      </motion.div>
    </div>
  );
}
