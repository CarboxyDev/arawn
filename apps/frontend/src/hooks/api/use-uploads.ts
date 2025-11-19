import type {
  DeleteUploadParams,
  GetUploadsQuery,
  Upload,
  UploadResponse,
  UploadStats,
} from '@repo/packages-types';
import {
  useMutation,
  type UseMutationOptions,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';

import { api } from '@/lib/api';

/**
 * Query Keys
 * Centralized query keys for cache management and invalidation
 */
export const uploadKeys = {
  all: ['uploads'] as const,
  lists: () => [...uploadKeys.all, 'list'] as const,
  list: (params: GetUploadsQuery) => [...uploadKeys.lists(), params] as const,
  stats: () => [...uploadKeys.all, 'stats'] as const,
};

/**
 * Fetch user's uploads
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useFetchUploads({ limit: 50, offset: 0 });
 * ```
 */
export function useFetchUploads(
  params: GetUploadsQuery = { limit: 50, offset: 0 },
  options?: Omit<UseQueryOptions<Upload[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: uploadKeys.list(params),
    queryFn: async () => {
      const searchParams = new globalThis.URLSearchParams({
        limit: String(params.limit),
        offset: String(params.offset),
      });

      return api.get<Upload[]>(`/uploads?${searchParams.toString()}`);
    },
    ...options,
  });
}

/**
 * Fetch upload statistics
 *
 * @example
 * ```tsx
 * const { data: stats } = useFetchUploadStats();
 * // stats: { totalFiles: 10, totalSize: 5242880 }
 * ```
 */
export function useFetchUploadStats(
  options?: Omit<UseQueryOptions<UploadStats>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: uploadKeys.stats(),
    queryFn: () => api.get<UploadStats>('/uploads/stats'),
    ...options,
  });
}

/**
 * Upload a file
 *
 * @example
 * ```tsx
 * const uploadMutation = useUploadFile();
 *
 * const handleUpload = (file: File) => {
 *   uploadMutation.mutate(file, {
 *     onSuccess: (data) => console.log('Uploaded:', data.url),
 *     onError: (error) => console.error('Upload failed:', error)
 *   });
 * };
 * ```
 */
export function useUploadFile(
  options?: Omit<
    UseMutationOptions<UploadResponse, Error, globalThis.File>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: globalThis.File) => {
      const formData = new globalThis.FormData();
      formData.append('file', file);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/uploads`,
        {
          method: 'POST',
          body: formData,
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Upload failed');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: uploadKeys.lists() });
      queryClient.invalidateQueries({ queryKey: uploadKeys.stats() });
    },
    ...options,
  });
}

/**
 * Delete an upload
 *
 * @example
 * ```tsx
 * const deleteMutation = useDeleteUpload();
 *
 * const handleDelete = (uploadId: string) => {
 *   deleteMutation.mutate({ id: uploadId });
 * };
 * ```
 */
export function useDeleteUpload(
  options?: Omit<
    UseMutationOptions<void, Error, DeleteUploadParams>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: DeleteUploadParams) => {
      await api.delete(`/uploads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: uploadKeys.lists() });
      queryClient.invalidateQueries({ queryKey: uploadKeys.stats() });
    },
    ...options,
  });
}
