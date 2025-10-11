/* eslint-disable no-undef */
import { env } from './env';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface FetcherOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
  timeout?: number;
}

async function fetcher<T>(
  endpoint: string,
  options: FetcherOptions = {}
): Promise<T> {
  const { params, timeout, signal, ...init } = options;

  // Build URL with query params
  const url = new URL(`${env.apiUrl}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }

  // Handle timeout with AbortController
  const controller = new AbortController();
  const timeoutId = timeout
    ? setTimeout(() => controller.abort(), timeout)
    : null;

  // Combine with external signal if provided
  if (signal) {
    signal.addEventListener('abort', () => controller.abort());
  }

  try {
    const response = await fetch(url.toString(), {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...init.headers,
      },
      credentials: 'include',
    });

    if (timeoutId) clearTimeout(timeoutId);

    // Parse response based on content type
    let data: unknown;
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      throw new ApiError(
        (data as { message?: string })?.message || `HTTP ${response.status}`,
        response.status,
        data
      );
    }

    return data as T;
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId);

    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle timeout
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }

    throw error;
  }
}

export const api = {
  get: <T>(url: string, options?: FetcherOptions) =>
    fetcher<T>(url, { ...options, method: 'GET' }),

  post: <T>(url: string, body?: unknown, options?: FetcherOptions) =>
    fetcher<T>(url, { ...options, method: 'POST', body: JSON.stringify(body) }),

  put: <T>(url: string, body?: unknown, options?: FetcherOptions) =>
    fetcher<T>(url, { ...options, method: 'PUT', body: JSON.stringify(body) }),

  patch: <T>(url: string, body?: unknown, options?: FetcherOptions) =>
    fetcher<T>(url, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  delete: <T>(url: string, options?: FetcherOptions) =>
    fetcher<T>(url, { ...options, method: 'DELETE' }),
};

// Error helpers
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) return error.message;
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
}
