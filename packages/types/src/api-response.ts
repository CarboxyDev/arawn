import { z } from 'zod';

/**
 * Standard error response returned by all API endpoints
 * Used by global error handler for consistent error formatting
 */
export const ErrorResponseSchema = z.object({
  error: z.object({
    message: z.string(),
    code: z.string(),
    details: z.record(z.string(), z.unknown()).optional(),
  }),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

/**
 * Standard success response wrapper for single items
 * Used for: GET /users/:id, POST /users, etc.
 */
export const SuccessResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
  });

export type SuccessResponse<T> = {
  data: T;
};

/**
 * Simple message response for action/command operations
 * Used for: password changes, session revocations, deletions with confirmation
 */
export const MessageResponseSchema = z.object({
  message: z.string(),
});

export type MessageResponse = {
  message: string;
};

/**
 * List response for collections without pagination
 * Used for: sessions list, etc.
 */
export const ListResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: z.array(dataSchema),
  });

export type ListResponse<T> = {
  data: T[];
};
