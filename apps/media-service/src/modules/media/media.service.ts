import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { MediaAssetStatus, MediaAssetVisibility } from '@prisma/client';
import { v4 as uuid } from 'uuid';

import { createChildLogger } from '@cartrader/logger';

import { MediaServiceEnv } from '../../config/environment';
import { CreateUploadDto } from './dto/create-upload.dto';
import { CompleteUploadDto } from './dto/complete-upload.dto';
import { MediaRepository, MediaAssetRecord } from './media.repository';

export interface UploadResponse {
  assetId: string;
  storageKey: string;
  uploadUrl: string;
  expiresAt: string;
  bucket: string;
}

export interface MediaAsset {
  id: string;
  storageKey: string;
  bucket: string;
  contentType: string | null;
  byteSize: string | null;
  checksumSha256: string | null;
  status: MediaAssetStatus;
  visibility: MediaAssetVisibility;
  uploadedAt: string | null;
  createdAt: string;
  updatedAt: string;
  ownerId: string | null;
  publicUrl: string | null;
}

@Injectable()
export class MediaService {
  private readonly logger = createChildLogger({ context: MediaService.name });
  private readonly bucket: string;
  private readonly uploadTtlSeconds: number;
  private readonly downloadTtlSeconds: number;
  private readonly assetBaseUrl: string | null;

  constructor(
    private readonly repository: MediaRepository,
    private readonly configService: ConfigService<MediaServiceEnv>,
    private readonly s3Client: S3Client,
  ) {
    this.bucket = this.getRequiredString('MEDIA_S3_BUCKET');
    this.uploadTtlSeconds = this.getRequiredNumber('MEDIA_UPLOAD_URL_TTL');
    this.downloadTtlSeconds = this.getRequiredNumber('MEDIA_DOWNLOAD_URL_TTL');
    this.assetBaseUrl = this.configService.get('MEDIA_ASSET_BASE_URL', { infer: true }) ?? null;
  }

  async requestUpload(dto: CreateUploadDto): Promise<UploadResponse> {
    const ownerId = dto.ownerId ? this.parseBigInt(dto.ownerId, 'ownerId') : null;
    const byteSize = dto.byteSize !== undefined ? this.toBigInt(dto.byteSize, 'byteSize') : null;

    const storageKey = this.buildStorageKey(dto.filename);

    const record = await this.repository.createMediaAsset({
      storageKey,
      bucket: this.bucket,
      contentType: dto.contentType ?? null,
      byteSize,
      checksumSha256: dto.checksumSha256 ?? null,
      visibility: dto.visibility ?? MediaAssetVisibility.PRIVATE,
      ownerId,
    });

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: storageKey,
      ContentType: dto.contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: this.uploadTtlSeconds });
    const expiresAt = new Date(Date.now() + this.uploadTtlSeconds * 1000).toISOString();

    this.logger.info({ assetId: record.id.toString(), storageKey }, 'Issued upload URL');

    return {
      assetId: record.id.toString(),
      storageKey,
      uploadUrl,
      expiresAt,
      bucket: this.bucket,
    };
  }

  async completeUpload(assetId: string, dto: CompleteUploadDto): Promise<MediaAsset> {
    const id = this.parseBigInt(assetId, 'assetId');
    const record = await this.repository.findById(id);

    if (!record) {
      throw new NotFoundException('Media asset not found');
    }

    const updated = await this.repository.updateMediaAsset(id, {
      checksumSha256: dto.checksumSha256 ?? record.checksumSha256 ?? null,
      status: MediaAssetStatus.READY,
      uploadedAt: new Date(),
    });

    this.logger.info({ assetId: assetId }, 'Marked asset as ready');

    return this.toPublicAsset(updated);
  }

  async getAsset(assetId: string): Promise<MediaAsset> {
    const id = this.parseBigInt(assetId, 'assetId');
    const record = await this.repository.findById(id);

    if (!record) {
      throw new NotFoundException('Media asset not found');
    }

    return this.toPublicAsset(record);
  }

  async getDownloadUrl(assetId: string): Promise<{ downloadUrl: string; expiresAt: string }> {
    const id = this.parseBigInt(assetId, 'assetId');
    const record = await this.repository.findById(id);

    if (!record) {
      throw new NotFoundException('Media asset not found');
    }

    if (record.status !== MediaAssetStatus.READY) {
      throw new BadRequestException('Asset is not ready for download');
    }

    const command = new GetObjectCommand({
      Bucket: record.bucket,
      Key: record.storageKey,
    });

    const downloadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: this.downloadTtlSeconds });
    const expiresAt = new Date(Date.now() + this.downloadTtlSeconds * 1000).toISOString();

    return { downloadUrl, expiresAt };
  }

  private buildStorageKey(filename?: string): string {
    const base = uuid();

    if (!filename) {
      return `uploads/${base}`;
    }

    const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    return `uploads/${base}-${sanitized}`;
  }

  private parseBigInt(value: string, field: string): bigint {
    try {
      return BigInt(value);
    } catch {
      throw new BadRequestException(`${field} is not a valid identifier`);
    }
  }

  private toBigInt(value: number, field: string): bigint {
    if (!Number.isInteger(value)) {
      throw new BadRequestException(`${field} must be an integer`);
    }

    if (value < 0) {
      throw new BadRequestException(`${field} must be non-negative`);
    }

    return BigInt(value);
  }

  private toPublicAsset(record: MediaAssetRecord): MediaAsset {
    return {
      id: record.id.toString(),
      storageKey: record.storageKey,
      bucket: record.bucket,
      contentType: record.contentType,
      byteSize: record.byteSize ? record.byteSize.toString() : null,
      checksumSha256: record.checksumSha256,
      status: record.status,
      visibility: record.visibility,
      uploadedAt: record.uploadedAt ? record.uploadedAt.toISOString() : null,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
      ownerId: record.ownerId ? record.ownerId.toString() : null,
      publicUrl: this.buildPublicUrl(record),
    };
  }

  private buildPublicUrl(record: MediaAssetRecord): string | null {
    if (!this.assetBaseUrl) {
      return null;
    }

    return `${this.assetBaseUrl.replace(/\/$/, '')}/${encodeURIComponent(record.storageKey)}`;
  }

  private getRequiredString(key: keyof MediaServiceEnv & string): string {
    const value = this.configService.get<string>(key, { infer: true });
    if (!value) {
      throw new Error(`Missing required configuration value: ${key}`);
    }

    return value;
  }

  private getRequiredNumber(key: keyof MediaServiceEnv & string): number {
    const value = this.configService.get<number>(key, { infer: true });
    if (value === undefined || value === null) {
      throw new Error(`Missing required configuration value: ${key}`);
    }

    return value;
  }
}
