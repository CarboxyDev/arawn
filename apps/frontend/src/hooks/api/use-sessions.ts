import type { ApiResponse } from '@repo/shared-types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetcher } from '@/lib/api';

export interface SessionInfo {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  isCurrent?: boolean;
}

export function useGetSessions() {
  return useQuery<ApiResponse<SessionInfo[]>>({
    queryKey: ['sessions'],
    queryFn: () => fetcher<ApiResponse<SessionInfo[]>>('/sessions'),
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) =>
      fetcher<ApiResponse>(`/sessions/${sessionId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

export function useRevokeAllSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      fetcher<ApiResponse>('/sessions', {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}
