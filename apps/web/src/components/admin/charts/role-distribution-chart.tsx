'use client';

import type { RoleDistributionItem } from '@repo/packages-types/stats';
import { Skeleton } from '@repo/packages-ui/skeleton';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import { SimpleChartTooltip } from './chart-tooltip';

interface RoleDistributionChartProps {
  data: RoleDistributionItem[];
}

const ROLE_COLORS: Record<string, string> = {
  user: '#3b82f6',
  admin: '#f59e0b',
  super_admin: '#ef4444',
};

const ROLE_LABELS: Record<string, string> = {
  user: 'Users',
  admin: 'Admins',
  super_admin: 'Super Admins',
};

export function RoleDistributionChart({ data }: RoleDistributionChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    name: ROLE_LABELS[item.role] || item.role,
    color: ROLE_COLORS[item.role] || '#94a3b8',
  }));

  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="bg-card rounded-xl border p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold">Role Distribution</h3>
        <p className="text-muted-foreground text-xs">
          Users by permission level
        </p>
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={2}
              dataKey="count"
              nameKey="name"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={
                <SimpleChartTooltip
                  valueFormatter={(value: number) => [
                    `${value} (${((value / total) * 100).toFixed(1)}%)`,
                    'Count',
                  ]}
                />
              }
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-foreground text-xs">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function RoleDistributionChartSkeleton() {
  return (
    <div className="bg-card rounded-xl border p-5">
      <div className="mb-4 space-y-1">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-36" />
      </div>
      <div className="flex h-[200px] items-center justify-center">
        <Skeleton className="size-[150px] rounded-full" />
      </div>
    </div>
  );
}
