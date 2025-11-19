import fs from 'node:fs/promises';
import path from 'node:path';

import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import sharp from 'sharp';

import type { LoggerService } from '@/common/logger.service';
import type { Env } from '@/config/env';
import { isImageFile } from '@/utils/file-validation';

export interface FileUploadResult {
  filename: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface FileUploadOptions {
  buffer: Buffer;
  originalFilename: string;
  mimeType: string;
  optimizeImage?: boolean;
}

export class FileStorageService {
  private s3Client?: S3Client;
  private storageType: 'local' | 's3' | 'r2';
  private localUploadDir: string;

  constructor(
    private readonly env: Env,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext('FileStorageService');
    this.storageType = env.STORAGE_TYPE || 'local';
    this.localUploadDir = path.join(process.cwd(), 'public', 'uploads');

    this.initializeStorage();
  }

  private initializeStorage(): void {
    if (this.storageType === 'local') {
      this.logger.info('Using local file storage', {
        uploadDir: this.localUploadDir,
      });
      return;
    }

    // Initialize S3/R2 client
    const {
      S3_BUCKET,
      S3_REGION,
      S3_ACCESS_KEY_ID,
      S3_SECRET_ACCESS_KEY,
      S3_ENDPOINT,
    } = this.env;

    if (
      !S3_BUCKET ||
      !S3_REGION ||
      !S3_ACCESS_KEY_ID ||
      !S3_SECRET_ACCESS_KEY
    ) {
      this.logger.warn(
        'S3 credentials incomplete, falling back to local storage'
      );
      this.storageType = 'local';
      return;
    }

    const clientConfig: ConstructorParameters<typeof S3Client>[0] = {
      region: S3_REGION,
      credentials: {
        accessKeyId: S3_ACCESS_KEY_ID,
        secretAccessKey: S3_SECRET_ACCESS_KEY,
      },
    };

    // Add custom endpoint for MinIO/R2
    if (S3_ENDPOINT) {
      clientConfig.endpoint = S3_ENDPOINT;
      clientConfig.forcePathStyle = true; // Required for MinIO
      this.logger.info('Using S3-compatible storage', {
        endpoint: S3_ENDPOINT,
        type: this.storageType,
      });
    } else {
      this.logger.info('Using AWS S3 storage', { region: S3_REGION });
    }

    this.s3Client = new S3Client(clientConfig);
  }

  async uploadFile(options: FileUploadOptions): Promise<FileUploadResult> {
    let { buffer } = options;
    const { originalFilename, mimeType, optimizeImage = true } = options;

    // Optimize images if enabled
    if (optimizeImage && isImageFile(mimeType)) {
      buffer = await this.optimizeImage(buffer, mimeType);
    }

    const size = buffer.length;

    if (this.storageType === 'local') {
      return this.uploadToLocal(buffer, originalFilename, mimeType, size);
    }

    return this.uploadToS3(buffer, originalFilename, mimeType, size);
  }

  private async uploadToLocal(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    size: number
  ): Promise<FileUploadResult> {
    // Ensure upload directory exists
    await fs.mkdir(this.localUploadDir, { recursive: true });

    const filePath = path.join(this.localUploadDir, filename);
    await fs.writeFile(filePath, buffer);

    this.logger.info('File uploaded to local storage', { filename, size });

    // Return URL relative to API server
    const url = `${this.env.API_URL}/uploads/files/${filename}`;

    return { filename, url, size, mimeType };
  }

  private async uploadToS3(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    size: number
  ): Promise<FileUploadResult> {
    if (!this.s3Client) {
      throw new Error('S3 client not initialized');
    }

    const bucket = this.env.S3_BUCKET!;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: filename,
      Body: buffer,
      ContentType: mimeType,
      // Make files publicly readable (adjust based on your security needs)
      ACL: 'public-read',
    });

    await this.s3Client.send(command);

    this.logger.info('File uploaded to S3', { filename, size, bucket });

    // Construct public URL
    const url = this.getS3Url(filename);

    return { filename, url, size, mimeType };
  }

  async deleteFile(filename: string): Promise<void> {
    if (this.storageType === 'local') {
      return this.deleteFromLocal(filename);
    }

    return this.deleteFromS3(filename);
  }

  private async deleteFromLocal(filename: string): Promise<void> {
    const filePath = path.join(this.localUploadDir, filename);

    try {
      await fs.unlink(filePath);
      this.logger.info('File deleted from local storage', { filename });
    } catch (error) {
      const err = error as { code?: string };
      if (err.code !== 'ENOENT') {
        throw error;
      }
      this.logger.warn('File not found for deletion', { filename });
    }
  }

  private async deleteFromS3(filename: string): Promise<void> {
    if (!this.s3Client) {
      throw new Error('S3 client not initialized');
    }

    const bucket = this.env.S3_BUCKET!;

    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: filename,
    });

    await this.s3Client.send(command);

    this.logger.info('File deleted from S3', { filename, bucket });
  }

  private async optimizeImage(
    buffer: Buffer,
    mimeType: string
  ): Promise<Buffer> {
    try {
      let transformer = sharp(buffer).rotate(); // Auto-rotate based on EXIF

      // Resize if too large (max 2048px on longest side)
      const metadata = await sharp(buffer).metadata();
      const maxDimension = Math.max(metadata.width || 0, metadata.height || 0);

      if (maxDimension > 2048) {
        transformer = transformer.resize(2048, 2048, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      // Convert and compress based on type
      if (mimeType === 'image/png') {
        transformer = transformer.png({ quality: 90, compressionLevel: 9 });
      } else if (mimeType === 'image/webp') {
        transformer = transformer.webp({ quality: 90 });
      } else {
        // Default to JPEG for other formats
        transformer = transformer.jpeg({ quality: 85 });
      }

      const optimized = await transformer.toBuffer();

      this.logger.detailed().debug('Image optimized', {
        originalSize: buffer.length,
        optimizedSize: optimized.length,
        reduction: Math.round(
          ((buffer.length - optimized.length) / buffer.length) * 100
        ),
      });

      return optimized;
    } catch (error) {
      this.logger.warn('Image optimization failed, using original', { error });
      return buffer;
    }
  }

  private getS3Url(filename: string): string {
    const { S3_BUCKET, S3_REGION, S3_ENDPOINT } = this.env;

    // For custom endpoints (MinIO, R2, etc.)
    if (S3_ENDPOINT) {
      return `${S3_ENDPOINT}/${S3_BUCKET}/${filename}`;
    }

    // Standard AWS S3 URL
    return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${filename}`;
  }

  getStorageType(): string {
    return this.storageType;
  }
}
