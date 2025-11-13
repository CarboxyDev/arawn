import { z } from 'zod';

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
