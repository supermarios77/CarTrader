import {
  Injectable,
  Logger,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import * as MinIO from 'minio';
import { randomUUID } from 'crypto';
import { extname } from 'path';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private minioClient: MinIO.Client;
  private readonly bucketName = 'vehicles';

  constructor() {
    const endpoint = process.env.MINIO_ENDPOINT || 'localhost';
    const port = parseInt(process.env.MINIO_PORT || '9000', 10);
    const useSSL = process.env.MINIO_USE_SSL === 'true';
    const accessKey = process.env.MINIO_ACCESS_KEY || 'minioadmin';
    const secretKey = process.env.MINIO_SECRET_KEY || 'minioadmin123';

    this.minioClient = new MinIO.Client({
      endPoint: endpoint,
      port: port,
      useSSL: useSSL,
      accessKey: accessKey,
      secretKey: secretKey,
    });
  }

  async onModuleInit() {
    await this.initializeBucket();
  }

  /**
   * Initialize bucket if it doesn't exist
   */
  private async initializeBucket(): Promise<void> {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        this.logger.log(`✅ Created bucket: ${this.bucketName}`);
      }
    } catch (error) {
      this.logger.error(`Failed to initialize bucket: ${error}`);
      // Don't throw - allow service to start even if bucket creation fails
      // It will be created on first upload
    }
  }

  /**
   * Validate file type and size
   */
  private validateFile(
    file: Express.Multer.File,
    maxSize: number = 5 * 1024 * 1024, // 5MB default
  ): void {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`,
      );
    }

    const ext = extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      throw new BadRequestException(
        `Invalid file extension. Allowed extensions: ${allowedExtensions.join(', ')}`,
      );
    }

    if (file.size > maxSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`,
      );
    }
  }

  /**
   * Upload a single image file
   */
  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'images',
  ): Promise<{ url: string; key: string }> {
    this.validateFile(file);

    const fileExtension = extname(file.originalname).toLowerCase();
    const fileName = `${folder}/${randomUUID()}${fileExtension}`;

    try {
      await this.minioClient.putObject(
        this.bucketName,
        fileName,
        file.buffer,
        file.size,
        {
          'Content-Type': file.mimetype,
        },
      );

      // Construct public URL for frontend access
      // In dev, use localhost with exposed port
      // In production, use your domain/CDN
      const isDev = process.env.NODE_ENV === 'development';
      const publicEndpoint = process.env.MINIO_PUBLIC_ENDPOINT || (isDev ? 'localhost' : process.env.MINIO_ENDPOINT || 'localhost');
      const publicPort = process.env.MINIO_PUBLIC_PORT || (isDev ? '9000' : process.env.MINIO_PORT || '9000');
      const useSSL = process.env.MINIO_USE_SSL === 'true';
      const protocol = useSSL ? 'https' : 'http';
      const url = `${protocol}://${publicEndpoint}:${publicPort}/${this.bucketName}/${fileName}`;

      this.logger.log(`✅ Uploaded image: ${fileName}`);

      return { url, key: fileName };
    } catch (error) {
      this.logger.error(`Failed to upload image: ${error}`);
      throw new BadRequestException('Failed to upload image');
    }
  }

  /**
   * Upload multiple images
   */
  async uploadImages(
    files: Express.Multer.File[],
    folder: string = 'images',
  ): Promise<Array<{ url: string; key: string }>> {
    if (!files || files.length === 0) {
      return [];
    }

    if (files.length > 10) {
      throw new BadRequestException('Maximum 10 images allowed per vehicle');
    }

    const uploadPromises = files.map((file) => this.uploadImage(file, folder));
    return Promise.all(uploadPromises);
  }

  /**
   * Delete an image
   */
  async deleteImage(key: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucketName, key);
      this.logger.log(`✅ Deleted image: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete image: ${error}`);
      // Don't throw - image might not exist
    }
  }

  /**
   * Delete multiple images
   */
  async deleteImages(keys: string[]): Promise<void> {
    if (!keys || keys.length === 0) {
      return;
    }

    try {
      await this.minioClient.removeObjects(this.bucketName, keys);
      this.logger.log(`✅ Deleted ${keys.length} images`);
    } catch (error) {
      this.logger.error(`Failed to delete images: ${error}`);
    }
  }

  /**
   * Get presigned URL for temporary access (optional)
   */
  async getPresignedUrl(key: string, expiry: number = 7 * 24 * 60 * 60): Promise<string> {
    try {
      return await this.minioClient.presignedGetObject(
        this.bucketName,
        key,
        expiry,
      );
    } catch (error) {
      this.logger.error(`Failed to generate presigned URL: ${error}`);
      throw new BadRequestException('Failed to generate image URL');
    }
  }
}

