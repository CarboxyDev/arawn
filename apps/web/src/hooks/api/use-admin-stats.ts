import type {
  HealthCheckResponse,
  SystemStats,
} from '@repo/packages-types/stats';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api';

export const adminStatsKeys = {
  all: ['adminStats'] as const,
  stats: () => [...adminStatsKeys.all, 'stats'] as const,
  health: () => [...adminStatsKeys.all, 'health'] as const,
};

export function useFetchSystemStats(
  options?: Omit<UseQueryOptions<SystemStats>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: adminStatsKeys.stats(),
    queryFn: () => api.get<SystemStats>('/admin/stats'),
    ...options,
  });
}

export function useFetchHealthCheck(
  options?: Omit<UseQueryOptions<HealthCheckResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: adminStatsKeys.health(),
    queryFn: () => api.get<HealthCheckResponse>('/admin/stats/health'),
    ...options,
  });
}
