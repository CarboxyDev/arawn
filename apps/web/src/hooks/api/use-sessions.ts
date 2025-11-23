import type {
  ListResponse,
  MessageResponse,
} from '@repo/packages-types/api-response';
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
  return useQuery<ListResponse<SessionInfo>>({
    queryKey: ['sessions'],
    queryFn: () => fetcher<ListResponse<SessionInfo>>('/sessions'),
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) =>
      fetcher<MessageResponse>(`/sessions/${sessionId}`, {
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
      fetcher<MessageResponse>('/sessions', {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}
