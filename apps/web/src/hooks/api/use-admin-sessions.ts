import type { PaginatedResponse } from '@repo/packages-types/pagination';
import type {
  AdminSession,
  QuerySessions,
  SessionStats,
} from '@repo/packages-types/session';
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';

import { api } from '@/lib/api';

export const adminSessionKeys = {
  all: ['adminSessions'] as const,
  lists: () => [...adminSessionKeys.all, 'list'] as const,
  list: (params: QuerySessions) =>
    [...adminSessionKeys.lists(), params] as const,
  stats: () => [...adminSessionKeys.all, 'stats'] as const,
};

export function useFetchAdminSessions(
  params: QuerySessions,
  options?: Omit<
    UseQueryOptions<PaginatedResponse<AdminSession>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: adminSessionKeys.list(params),
    queryFn: () =>
      api.get<PaginatedResponse<AdminSession>>('/admin/sessions', {
        params: params as Record<string, string | number | boolean>,
      }),
    ...options,
  });
}

export function useFetchSessionStats(
  options?: Omit<UseQueryOptions<SessionStats>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: adminSessionKeys.stats(),
    queryFn: () => api.get<SessionStats>('/admin/sessions/stats'),
    ...options,
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) =>
      api.delete(`/admin/sessions/${sessionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminSessionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminSessionKeys.stats() });
    },
  });
}

export function useRevokeUserSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      api.delete(`/admin/sessions/user/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminSessionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminSessionKeys.stats() });
    },
  });
}
