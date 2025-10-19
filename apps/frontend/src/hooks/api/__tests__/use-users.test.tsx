import type {
  ApiResponse,
  CreateUser,
  PaginatedResponse,
  User,
} from '@repo/shared-types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as apiModule from '@/lib/api';

import {
  useCreateUser,
  useFetchUser,
  useFetchUsers,
  userKeys,
} from '../use-users';

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
  isApiError: vi.fn(),
  getErrorMessage: vi.fn(),
  ApiError: class ApiError extends Error {
    constructor(
      message: string,
      public status: number,
      public data?: unknown
    ) {
      super(message);
      this.name = 'ApiError';
    }
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useUsers API Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useFetchUsers', () => {
    it('should fetch paginated users successfully', async () => {
      const mockResponse: PaginatedResponse<User> = {
        success: true,
        data: [
          {
            id: '123',
            email: 'test@example.com',
            name: 'Test User',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            role: 'user',
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      vi.spyOn(apiModule.api, 'get').mockResolvedValue(mockResponse);

      const { result } = renderHook(
        () =>
          useFetchUsers({
            page: 1,
            limit: 10,
            sortBy: 'createdAt',
            sortOrder: 'desc',
          }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
      expect(apiModule.api.get).toHaveBeenCalledWith('/users', {
        params: { page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' },
      });
    });

    it('should use correct query key for caching', () => {
      const params = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt' as const,
        sortOrder: 'desc' as const,
      };
      const key = userKeys.list(params);

      expect(key).toEqual(['users', 'list', params]);
    });
  });

  describe('useFetchUser', () => {
    it('should fetch a single user by ID', async () => {
      const mockUser: ApiResponse<User> = {
        success: true,
        data: {
          id: '123',
          email: 'test@example.com',
          name: 'Test User',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          role: 'user',
        },
      };

      vi.spyOn(apiModule.api, 'get').mockResolvedValue(mockUser);

      const { result } = renderHook(() => useFetchUser('123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockUser);
      expect(apiModule.api.get).toHaveBeenCalledWith('/users/123');
    });

    it('should not fetch if ID is empty', () => {
      const { result } = renderHook(() => useFetchUser(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(apiModule.api.get).not.toHaveBeenCalled();
    });
  });

  describe('useCreateUser', () => {
    it('should create a new user', async () => {
      const newUser: CreateUser = {
        name: 'New User',
        email: 'new@example.com',
        role: 'user',
      };

      const mockResponse: ApiResponse<User> = {
        success: true,
        data: {
          id: '456',
          ...newUser,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      };

      vi.spyOn(apiModule.api, 'post').mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCreateUser(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(newUser);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
      expect(apiModule.api.post).toHaveBeenCalledWith('/users', newUser);
    });
  });

  describe('userKeys', () => {
    it('should generate correct query keys', () => {
      expect(userKeys.all).toEqual(['users']);
      expect(userKeys.lists()).toEqual(['users', 'list']);
      expect(userKeys.details()).toEqual(['users', 'detail']);
      expect(userKeys.detail('123')).toEqual(['users', 'detail', '123']);
    });
  });
});
