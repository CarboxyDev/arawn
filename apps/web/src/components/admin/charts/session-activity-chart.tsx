'use client';

import type { SessionActivityPoint } from '@repo/packages-types/stats';
import { Skeleton } from '@repo/packages-ui/skeleton';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { ChartTooltip } from './chart-tooltip';

interface SessionActivityChartProps {
  data: SessionActivityPoint[];
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function SessionActivityChart({ data }: SessionActivityChartProps) {
  return (
    <div className="bg-card rounded-xl border p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold">Session Activity</h3>
        <p className="text-muted-foreground text-xs">
          Login sessions created per day (30 days)
        </p>
      </div>
      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              className="stroke-zinc-200 dark:stroke-zinc-700"
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              className="text-zinc-500 dark:text-zinc-400"
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              className="text-zinc-500 dark:text-zinc-400"
            />
            <Tooltip
              content={<ChartTooltip labelFormatter={formatDate} />}
              cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }}
            />
            <Bar
              dataKey="count"
              name="Sessions"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function SessionActivityChartSkeleton() {
  return (
    <div className="bg-card rounded-xl border p-5">
      <div className="mb-4 space-y-1">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-44" />
      </div>
      <Skeleton className="h-[240px] w-full" />
    </div>
  );
}
