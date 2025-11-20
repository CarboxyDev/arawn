import type {
  AuditLog,
  AuditLogStats,
  PaginatedResponse,
  QueryAuditLogs,
} from '@repo/packages-types';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api';

/**
 * Query Keys
 * Centralized query keys for cache management and invalidation
 */
export const auditLogKeys = {
  all: ['auditLogs'] as const,
  lists: () => [...auditLogKeys.all, 'list'] as const,
  list: (params: QueryAuditLogs) => [...auditLogKeys.lists(), params] as const,
  stats: () => [...auditLogKeys.all, 'stats'] as const,
};

/**
 * Fetch audit logs with pagination and filtering (Admin only)
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useFetchAuditLogs({
 *   page: 1,
 *   limit: 20,
 *   action: 'user.created',
 *   sortOrder: 'desc'
 * });
 * ```
 */
export function useFetchAuditLogs(
  params: QueryAuditLogs = {
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  options?: Omit<
    UseQueryOptions<PaginatedResponse<AuditLog>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: auditLogKeys.list(params),
    queryFn: async () => {
      const searchParams = new globalThis.URLSearchParams();
      searchParams.set('page', String(params.page));
      searchParams.set('limit', String(params.limit));

      if (params.userId) searchParams.set('userId', params.userId);
      if (params.action) searchParams.set('action', params.action);
      if (params.resourceType)
        searchParams.set('resourceType', params.resourceType);
      if (params.startDate) searchParams.set('startDate', params.startDate);
      if (params.endDate) searchParams.set('endDate', params.endDate);
      if (params.search) searchParams.set('search', params.search);
      if (params.sortBy) searchParams.set('sortBy', params.sortBy);
      if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

      return api.get<PaginatedResponse<AuditLog>>(
        `/audit?${searchParams.toString()}`
      );
    },
    ...options,
  });
}

/**
 * Fetch audit log statistics (Admin only)
 *
 * @example
 * ```tsx
 * const { data: stats } = useFetchAuditLogStats();
 * // stats: { totalLogs, logsByAction, logsByResourceType, recentActivity }
 * ```
 */
export function useFetchAuditLogStats(
  options?: Omit<UseQueryOptions<AuditLogStats>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: auditLogKeys.stats(),
    queryFn: () => api.get<AuditLogStats>('/audit/stats'),
    ...options,
  });
}
