import { z } from 'zod';

export const UploadSchema = z.object({
  id: z.string().describe('Unique upload identifier'),
  filename: z.string().describe('Generated filename on server'),
  originalName: z.string().describe('Original filename from upload'),
  mimeType: z.string().describe('File MIME type'),
  size: z.number().int().positive().describe('File size in bytes'),
  url: z.string().url().describe('Public URL to access the file'),
  userId: z.string().describe('ID of user who uploaded the file'),
  createdAt: z.coerce.date().describe('Upload timestamp'),
  updatedAt: z.coerce.date().describe('Last modification timestamp'),
});

export type Upload = z.infer<typeof UploadSchema>;

export const UploadResponseSchema = z.object({
  id: z.string().describe('Unique upload identifier'),
  filename: z.string().describe('Generated filename on server'),
  originalName: z.string().describe('Original filename from upload'),
  mimeType: z.string().describe('File MIME type'),
  size: z.number().int().positive().describe('File size in bytes'),
  url: z.string().url().describe('Public URL to access the file'),
  createdAt: z.coerce.date().describe('Upload timestamp'),
  user: z.object({
    id: z.string().describe('User ID'),
    name: z.string().nullable().describe('User name'),
  }),
});

export type UploadResponse = z.infer<typeof UploadResponseSchema>;

export const GetUploadsQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .default(50)
    .describe('Maximum number of uploads to return (max 100)'),
  offset: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(0)
    .describe('Number of uploads to skip for pagination'),
});

export type GetUploadsQuery = z.infer<typeof GetUploadsQuerySchema>;

export const DeleteUploadParamsSchema = z.object({
  id: z.string().min(1).describe('Upload ID to delete'),
});

export type DeleteUploadParams = z.infer<typeof DeleteUploadParamsSchema>;

export const UploadStatsSchema = z.object({
  totalFiles: z
    .number()
    .int()
    .nonnegative()
    .describe('Total number of files uploaded'),
  totalSize: z
    .number()
    .int()
    .nonnegative()
    .describe('Total size of all uploads in bytes'),
});

export type UploadStats = z.infer<typeof UploadStatsSchema>;
