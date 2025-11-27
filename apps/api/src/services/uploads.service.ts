import type { MultipartFile } from '@fastify/multipart';
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '@repo/packages-utils/errors';

import type { LoggerService } from '@/common/logger.service';
import type { PrismaClient, Upload } from '@/generated/client/client.js';
import {
  generateUniqueFilename,
  MAX_FILE_SIZE,
  validateFile,
} from '@/utils/file-validation';

import type { FileStorageService } from './file-storage.service';

export class UploadsService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly fileStorage: FileStorageService,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext('UploadsService');
  }

  async uploadFile(
    file: MultipartFile,
    userId: string
  ): Promise<Upload & { user: { id: string; name: string | null } }> {
    // Validate file type and extension
    const validation = validateFile(file);
    if (!validation.valid && validation.error) {
      throw new ValidationError(validation.error.message);
    }

    // Buffer file and check size
    const buffer = await file.toBuffer();

    if (buffer.length > MAX_FILE_SIZE) {
      throw new ValidationError(
        `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`
      );
    }

    this.logger.info('Processing file upload', {
      originalName: file.filename,
      mimeType: file.mimetype,
      size: buffer.length,
      userId,
    });

    // Generate unique filename
    const uniqueFilename = generateUniqueFilename(file.filename);

    // Upload to storage (local or S3)
    const uploadResult = await this.fileStorage.uploadFile({
      buffer,
      originalFilename: uniqueFilename,
      mimeType: file.mimetype,
      optimizeImage: true,
    });

    // Save metadata to database
    const upload = await this.prisma.upload.create({
      data: {
        filename: uploadResult.filename,
        originalName: file.filename,
        mimeType: uploadResult.mimeType,
        size: uploadResult.size,
        url: uploadResult.url,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    this.logger.info('File upload completed', {
      uploadId: upload.id,
      filename: upload.filename,
      size: upload.size,
    });

    return upload;
  }

  async getUserUploads(
    userId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<Upload[]> {
    const { limit = 50, offset = 0 } = options || {};

    return this.prisma.upload.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async getUploadById(
    uploadId: string,
    userId: string
  ): Promise<Upload | null> {
    const upload = await this.prisma.upload.findUnique({
      where: { id: uploadId },
    });

    if (!upload) {
      return null;
    }

    // Ensure user owns the file
    if (upload.userId !== userId) {
      throw new ForbiddenError('Unauthorized to access this file');
    }

    return upload;
  }

  async deleteUpload(uploadId: string, userId: string): Promise<void> {
    const upload = await this.getUploadById(uploadId, userId);

    if (!upload) {
      throw new NotFoundError('Upload not found');
    }

    // Delete from storage
    await this.fileStorage.deleteFile(upload.filename);

    // Delete from database
    await this.prisma.upload.delete({
      where: { id: uploadId },
    });

    this.logger.info('Upload deleted', {
      uploadId,
      filename: upload.filename,
      userId,
    });
  }

  async getUploadStats(userId: string): Promise<{
    totalFiles: number;
    totalSize: number;
  }> {
    const uploads = await this.prisma.upload.findMany({
      where: { userId },
      select: { size: true },
    });

    return {
      totalFiles: uploads.length,
      totalSize: uploads.reduce((acc, upload) => acc + upload.size, 0),
    };
  }
}
