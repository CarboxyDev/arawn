'use client';

import type { UserGrowthPoint } from '@repo/packages-types/stats';
import { Skeleton } from '@repo/packages-ui/skeleton';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { ChartTooltip } from './chart-tooltip';

interface UserGrowthChartProps {
  data: UserGrowthPoint[];
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function UserGrowthChart({ data }: UserGrowthChartProps) {
  return (
    <div className="bg-card rounded-xl border p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold">User Growth</h3>
        <p className="text-muted-foreground text-xs">
          New signups and cumulative users (30 days)
        </p>
      </div>
      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
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
              className="text-zinc-500 dark:text-zinc-400"
            />
            <Tooltip
              content={<ChartTooltip labelFormatter={formatDate} />}
              cursor={{ stroke: 'rgba(99, 102, 241, 0.3)', strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="cumulative"
              name="Total Users"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#colorCumulative)"
            />
            <Area
              type="monotone"
              dataKey="count"
              name="New Users"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#colorNew)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function UserGrowthChartSkeleton() {
  return (
    <div className="bg-card rounded-xl border p-5">
      <div className="mb-4 space-y-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-[240px] w-full" />
    </div>
  );
}
