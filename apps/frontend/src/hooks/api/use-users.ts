import type {
  ApiResponse,
  CreateUser,
  PaginatedResponse,
  QueryUsers,
  User,
} from '@repo/shared-types';
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';

import { api } from '@/lib/api';

/**
 * Query Keys
 * Centralized query keys for cache management and invalidation
 */
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: QueryUsers) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

/**
 * Fetch paginated users with filtering and sorting
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useFetchUsers({
 *   page: 1,
 *   limit: 10,
 *   search: 'john',
 *   sortBy: 'createdAt',
 *   sortOrder: 'desc'
 * });
 * ```
 */
export function useFetchUsers(
  params: QueryUsers,
  options?: Omit<
    UseQueryOptions<PaginatedResponse<User>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () =>
      api.get<PaginatedResponse<User>>('/users', {
        params: params as Record<string, string | number | boolean>,
      }),
    ...options,
  });
}

/**
 * Fetch a single user by ID
 *
 * @example
 * ```tsx
 * const { data: user, isLoading } = useFetchUser('123e4567-e89b-12d3-a456-426614174000');
 * ```
 */
export function useFetchUser(
  id: string,
  options?: Omit<UseQueryOptions<ApiResponse<User>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => api.get<ApiResponse<User>>(`/users/${id}`),
    enabled: !!id,
    ...options,
  });
}

/**
 * Create a new user
 *
 * @example
 * ```tsx
 * const { mutate: createUser, isPending } = useCreateUser();
 *
 * const handleSubmit = (data: CreateUser) => {
 *   createUser(data);
 * };
 * ```
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUser) =>
      api.post<ApiResponse<User>>('/users', data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });

      if (data.data) {
        queryClient.setQueryData(userKeys.detail(data.data.id), data);
      }
    },
  });
}
