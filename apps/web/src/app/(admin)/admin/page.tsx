'use client';

import { Activity, CalendarDays, UserPlus, Users } from 'lucide-react';
import { useCallback, useState } from 'react';

import {
  ActivityFeedSkeleton,
  RecentSignupsFeed,
  TopActivityUsersFeed,
} from '@/components/admin/activity-feed';
import {
  AuthBreakdownChart,
  AuthBreakdownChartSkeleton,
} from '@/components/admin/charts/auth-breakdown-chart';
import {
  RealtimeMetricsChart,
  RealtimeMetricsChartSkeleton,
} from '@/components/admin/charts/realtime-metrics-chart';
import {
  RoleDistributionChart,
  RoleDistributionChartSkeleton,
} from '@/components/admin/charts/role-distribution-chart';
import {
  SessionActivityChart,
  SessionActivityChartSkeleton,
} from '@/components/admin/charts/session-activity-chart';
import {
  UserGrowthChart,
  UserGrowthChartSkeleton,
} from '@/components/admin/charts/user-growth-chart';
import {
  HealthIndicator,
  HealthIndicatorSkeleton,
} from '@/components/admin/health-indicator';
import { RefreshControl } from '@/components/admin/refresh-control';
import { StatCard, StatCardSkeleton } from '@/components/admin/stat-card';
import { useFetchSystemStats } from '@/hooks/api/use-admin-stats';

export default function AdminDashboardPage() {
  const [refreshInterval, setRefreshInterval] = useState<number | null>(15000);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const { data, isLoading, isFetching, refetch } = useFetchSystemStats({
    refetchInterval: refreshInterval ?? false,
    refetchOnWindowFocus: false,
  });

  const handleRefresh = useCallback(() => {
    refetch().then(() => setLastUpdated(new Date()));
  }, [refetch]);

  if (data && !lastUpdated) {
    setLastUpdated(new Date());
  }

  return (
    <div className="container mx-auto space-y-6 px-6 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">System Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time application metrics and health status
          </p>
        </div>
        <RefreshControl
          interval={refreshInterval}
          onIntervalChange={setRefreshInterval}
          onRefresh={handleRefresh}
          isRefreshing={isFetching}
          lastUpdated={lastUpdated}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : data ? (
          <>
            <StatCard
              title="Total Users"
              value={data.overview.totalUsers}
              icon={Users}
              accentColor="blue"
            />
            <StatCard
              title="Active Sessions (24h)"
              value={data.overview.activeSessionsLast24h}
              icon={Activity}
              accentColor="emerald"
            />
            <StatCard
              title="New Today"
              value={data.overview.newUsersToday}
              icon={UserPlus}
              accentColor="cyan"
            />
            <StatCard
              title="New This Week"
              value={data.overview.newUsersThisWeek}
              icon={CalendarDays}
              accentColor="amber"
            />
          </>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {isLoading ? (
          <RealtimeMetricsChartSkeleton />
        ) : (
          <RealtimeMetricsChart />
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {isLoading ? (
          <>
            <UserGrowthChartSkeleton />
            <SessionActivityChartSkeleton />
          </>
        ) : data ? (
          <>
            <UserGrowthChart data={data.userGrowth} />
            <SessionActivityChart data={data.sessionActivity} />
          </>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {isLoading ? (
          <>
            <RoleDistributionChartSkeleton />
            <AuthBreakdownChartSkeleton />
          </>
        ) : data ? (
          <>
            <RoleDistributionChart data={data.roleDistribution} />
            <AuthBreakdownChart data={data.authBreakdown} />
          </>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {isLoading ? (
          <>
            <ActivityFeedSkeleton />
            <ActivityFeedSkeleton />
            <HealthIndicatorSkeleton />
          </>
        ) : data ? (
          <>
            <RecentSignupsFeed signups={data.recentSignups} />
            <TopActivityUsersFeed users={data.topActivityUsers} />
            <HealthIndicator health={data.systemHealth} />
          </>
        ) : null}
      </div>
    </div>
  );
}
