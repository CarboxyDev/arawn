'use client';

import { cn } from '@repo/packages-ui/lib/utils';
import { Skeleton } from '@repo/packages-ui/skeleton';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { useEffect } from 'react';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  formatter?: (value: number) => string;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
  accentColor?: 'emerald' | 'blue' | 'amber' | 'rose' | 'violet' | 'cyan';
}

const accentColors = {
  emerald: {
    bg: 'bg-emerald-500/10',
    icon: 'text-emerald-500',
    trend: 'text-emerald-600',
  },
  blue: {
    bg: 'bg-blue-500/10',
    icon: 'text-blue-500',
    trend: 'text-blue-600',
  },
  amber: {
    bg: 'bg-amber-500/10',
    icon: 'text-amber-500',
    trend: 'text-amber-600',
  },
  rose: {
    bg: 'bg-rose-500/10',
    icon: 'text-rose-500',
    trend: 'text-rose-600',
  },
  violet: {
    bg: 'bg-violet-500/10',
    icon: 'text-violet-500',
    trend: 'text-violet-600',
  },
  cyan: {
    bg: 'bg-cyan-500/10',
    icon: 'text-cyan-500',
    trend: 'text-cyan-600',
  },
};

function AnimatedNumber({
  value,
  formatter = (v) => v.toLocaleString(),
}: {
  value: number;
  formatter?: (value: number) => string;
}) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) =>
    formatter(Math.round(latest))
  );

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 0.8,
      ease: 'easeOut',
    });
    return controls.stop;
  }, [value, motionValue]);

  return <motion.span>{rounded}</motion.span>;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  formatter,
  trend,
  className,
  accentColor = 'blue',
}: StatCardProps) {
  const colors = accentColors[accentColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-card relative overflow-hidden rounded-xl border p-5',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-1">
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          <p className="text-2xl font-semibold tracking-tight">
            <AnimatedNumber value={value} formatter={formatter} />
          </p>
          {trend && (
            <p className={cn('text-xs font-medium', colors.trend)}>
              +{trend.value} {trend.label}
            </p>
          )}
        </div>
        <div className={cn('rounded-lg p-2.5', colors.bg)}>
          <Icon className={cn('size-5', colors.icon)} />
        </div>
      </div>
      <div
        className={cn(
          'absolute -bottom-8 -right-8 size-24 rounded-full opacity-5',
          colors.bg
        )}
      />
    </motion.div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="size-10 rounded-lg" />
      </div>
    </div>
  );
}
