import type { MultipartFile } from '@fastify/multipart';

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

export const ALLOWED_MIME_TYPES = {
  // Images
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'image/svg+xml': ['.svg'],
  // Documents
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
    '.docx',
  ],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
    '.xlsx',
  ],
  'text/plain': ['.txt'],
  'text/csv': ['.csv'],
} as const;

export type AllowedMimeType = keyof typeof ALLOWED_MIME_TYPES;

export interface FileValidationError {
  field: string;
  message: string;
}

export interface FileValidationResult {
  valid: boolean;
  error?: FileValidationError;
}

export function validateFile(file: MultipartFile): FileValidationResult {
  const { mimetype, filename } = file;

  // Check if MIME type is allowed
  if (!isAllowedMimeType(mimetype)) {
    return {
      valid: false,
      error: {
        field: 'file',
        message: `File type '${mimetype}' is not allowed. Allowed types: images (JPEG, PNG, GIF, WebP, SVG), documents (PDF, DOC, DOCX, XLS, XLSX, TXT, CSV)`,
      },
    };
  }

  // Validate file extension matches MIME type
  const extension = getFileExtension(filename);
  const allowedExtensions = ALLOWED_MIME_TYPES[mimetype as AllowedMimeType];

  if (!(allowedExtensions as readonly string[]).includes(extension)) {
    return {
      valid: false,
      error: {
        field: 'file',
        message: `File extension '${extension}' does not match MIME type '${mimetype}'`,
      },
    };
  }

  return { valid: true };
}

export async function validateFileSize(
  file: MultipartFile
): Promise<FileValidationResult> {
  // Note: @fastify/multipart doesn't provide file size directly
  // We need to check size during streaming or after buffering
  // This is handled in the upload handler
  return { valid: true };
}

export function isAllowedMimeType(mimetype: string): boolean {
  return mimetype in ALLOWED_MIME_TYPES;
}

export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot === -1 ? '' : filename.slice(lastDot).toLowerCase();
}

export function isImageFile(mimetype: string): boolean {
  return mimetype.startsWith('image/');
}

export function sanitizeFilename(filename: string): string {
  // Remove path separators and special characters
  return filename
    .replace(/[/\\]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 255); // Limit filename length
}

export function generateUniqueFilename(originalFilename: string): string {
  const extension = getFileExtension(originalFilename);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  const sanitized = sanitizeFilename(
    originalFilename.replace(extension, '')
  ).slice(0, 50);

  return `${timestamp}-${random}-${sanitized}${extension}`;
}
