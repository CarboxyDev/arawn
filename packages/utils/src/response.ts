type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export function success<T>(data: T): { data: T } {
  return { data };
}

export function paginated<T>(
  data: T[],
  meta: PaginationMeta
): { data: T[]; meta: PaginationMeta } {
  return { data, meta };
}

export function error(
  message: string,
  code: string,
  details?: Record<string, unknown>
): {
  error: { message: string; code: string; details?: Record<string, unknown> };
} {
  return {
    error: {
      message,
      code,
      // Only include details if provided
      ...(details && { details }),
    },
  };
}
