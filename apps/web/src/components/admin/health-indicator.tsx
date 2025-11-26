'use client';

import type { SystemHealth } from '@repo/packages-types/stats';
import { cn } from '@repo/packages-ui/lib/utils';
import { Skeleton } from '@repo/packages-ui/skeleton';
import { motion } from 'framer-motion';
import { Activity, Clock, Database } from 'lucide-react';

interface HealthIndicatorProps {
  health: SystemHealth;
}

function formatUptime(seconds: number) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

const STATUS_CONFIG = {
  connected: {
    label: 'Healthy',
    color: 'bg-emerald-500',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-500/10',
  },
  degraded: {
    label: 'Degraded',
    color: 'bg-amber-500',
    textColor: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-500/10',
  },
  disconnected: {
    label: 'Offline',
    color: 'bg-rose-500',
    textColor: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-500/10',
  },
};

function PulseDot({
  status,
}: {
  status: 'connected' | 'degraded' | 'disconnected';
}) {
  const config = STATUS_CONFIG[status];

  return (
    <span className="relative flex size-3">
      <motion.span
        className={cn(
          'absolute inline-flex h-full w-full rounded-full opacity-75',
          config.color
        )}
        animate={{ scale: [1, 1.5, 1], opacity: [0.75, 0, 0.75] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <span
        className={cn('relative inline-flex size-3 rounded-full', config.color)}
      />
    </span>
  );
}

export function HealthIndicator({ health }: HealthIndicatorProps) {
  const dbStatus = STATUS_CONFIG[health.database];

  return (
    <div className="bg-card rounded-xl border p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">System Health</h3>
          <p className="text-muted-foreground text-xs">Real-time status</p>
        </div>
        <div
          className={cn(
            'flex items-center gap-2 rounded-full px-3 py-1',
            dbStatus.bgColor
          )}
        >
          <PulseDot status={health.database} />
          <span className={cn('text-xs font-medium', dbStatus.textColor)}>
            {dbStatus.label}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <Database className="size-4 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium">Database</p>
              <p className="text-muted-foreground text-xs">PostgreSQL</p>
            </div>
          </div>
          <div className="text-right">
            <p className={cn('text-sm font-medium', dbStatus.textColor)}>
              {dbStatus.label}
            </p>
            {health.dbLatencyMs !== undefined && (
              <p className="text-muted-foreground text-xs">
                {health.dbLatencyMs}ms latency
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-violet-500/10 p-2">
              <Clock className="size-4 text-violet-500" />
            </div>
            <div>
              <p className="text-sm font-medium">Uptime</p>
              <p className="text-muted-foreground text-xs">API Server</p>
            </div>
          </div>
          <p className="text-sm font-medium">{formatUptime(health.uptime)}</p>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/10 p-2">
              <Activity className="size-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-medium">Last Check</p>
              <p className="text-muted-foreground text-xs">Health check</p>
            </div>
          </div>
          <p className="text-muted-foreground text-xs">
            {new Date(health.lastChecked).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
}

export function HealthIndicatorSkeleton() {
  return (
    <div className="bg-card rounded-xl border p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg border p-3"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-2 w-12" />
              </div>
            </div>
            <Skeleton className="h-4 w-14" />
          </div>
        ))}
      </div>
    </div>
  );
}
