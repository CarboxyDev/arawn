'use client';

import type { AuthBreakdown } from '@repo/packages-types/stats';
import { Skeleton } from '@repo/packages-ui/skeleton';
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { SimpleChartTooltip } from './chart-tooltip';

interface AuthBreakdownChartProps {
  data: AuthBreakdown;
}

const AUTH_CONFIG = [
  { key: 'verified', label: 'Verified', color: '#10b981' },
  { key: 'unverified', label: 'Unverified', color: '#f59e0b' },
  { key: 'banned', label: 'Banned', color: '#ef4444' },
] as const;

export function AuthBreakdownChart({ data }: AuthBreakdownChartProps) {
  const chartData = AUTH_CONFIG.map((config) => ({
    name: config.label,
    count: data[config.key],
    color: config.color,
  }));

  const total = data.verified + data.unverified + data.banned;

  return (
    <div className="bg-card rounded-xl border p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold">Auth Status</h3>
        <p className="text-muted-foreground text-xs">
          Users by verification and ban status
        </p>
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <XAxis
              type="number"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              className="text-zinc-500 dark:text-zinc-400"
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={75}
              className="text-zinc-500 dark:text-zinc-400"
            />
            <Tooltip
              content={
                <SimpleChartTooltip
                  valueFormatter={(value: number) => [
                    `${value} (${total > 0 ? ((value / total) * 100).toFixed(1) : 0}%)`,
                    'Users',
                  ]}
                />
              }
              cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={28}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function AuthBreakdownChartSkeleton() {
  return (
    <div className="bg-card rounded-xl border p-5">
      <div className="mb-4 space-y-1">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-44" />
      </div>
      <div className="space-y-3 pt-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 flex-1" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-2/3" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-1/4" />
        </div>
      </div>
    </div>
  );
}
