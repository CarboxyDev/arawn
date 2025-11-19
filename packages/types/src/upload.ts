import { z } from 'zod';

export const UploadSchema = z.object({
  id: z.string(),
  filename: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number().int().positive(),
  url: z.string().url(),
  userId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Upload = z.infer<typeof UploadSchema>;

export const UploadResponseSchema = z.object({
  id: z.string(),
  filename: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number().int().positive(),
  url: z.string().url(),
  createdAt: z.coerce.date(),
  user: z.object({
    id: z.string(),
    name: z.string().nullable(),
  }),
});

export type UploadResponse = z.infer<typeof UploadResponseSchema>;

export const GetUploadsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().nonnegative().default(0),
});

export type GetUploadsQuery = z.infer<typeof GetUploadsQuerySchema>;

export const DeleteUploadParamsSchema = z.object({
  id: z.string().min(1),
});

export type DeleteUploadParams = z.infer<typeof DeleteUploadParamsSchema>;

export const UploadStatsSchema = z.object({
  totalFiles: z.number().int().nonnegative(),
  totalSize: z.number().int().nonnegative(),
});

export type UploadStats = z.infer<typeof UploadStatsSchema>;
