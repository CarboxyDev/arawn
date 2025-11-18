type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type SuccessResponse<T> = {
  data: T;
};

type ErrorResponse = {
  error: {
    message: string;
    code: string;
    details?: Record<string, unknown>;
  };
};

type MessageResponse = {
  message: string;
};

/**
 * Wraps data in standard success response format
 * @example
 * return success(user); // { data: user }
 */
export function success<T>(data: T): SuccessResponse<T> {
  return { data };
}

/**
 * Wraps paginated data with metadata
 * @example
 * return paginated(users, { page: 1, limit: 10, total: 100, totalPages: 10 });
 */
export function paginated<T>(
  data: T[],
  meta: PaginationMeta
): { data: T[]; meta: PaginationMeta } {
  return { data, meta };
}

/**
 * Creates standard error response (should rarely be used directly - let AppError handle this)
 * @example
 * return error('User not found', 'NOT_FOUND', { userId: '123' });
 */
export function error(
  message: string,
  code: string,
  details?: Record<string, unknown>
): ErrorResponse {
  return {
    error: {
      message,
      code,
      ...(details && { details }),
    },
  };
}

/**
 * Wraps a message in standard message response format
 * @example
 * return message('Password changed successfully');
 */
export function message(text: string): MessageResponse {
  return { message: text };
}
