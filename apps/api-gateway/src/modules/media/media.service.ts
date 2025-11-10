import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import { createChildLogger } from '@cartrader/logger';

import { loadApiGatewayConfig } from '../../config/environment';
import { CreateUploadDto } from './dto/create-upload.dto';
import { CompleteUploadDto } from './dto/complete-upload.dto';

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
  status: string;
  visibility: string;
  uploadedAt: string | null;
  createdAt: string;
  updatedAt: string;
  ownerId: string | null;
  publicUrl: string | null;
}

export interface DownloadUrlResponse {
  downloadUrl: string;
  expiresAt: string;
}

@Injectable()
export class MediaService {
  private readonly logger = createChildLogger({ context: MediaService.name });
  private readonly baseUrl: string;

  constructor(private readonly http: HttpService) {
    const { MEDIA_SERVICE_BASE_URL } = loadApiGatewayConfig();
    this.baseUrl = MEDIA_SERVICE_BASE_URL.replace(/\/$/, '');
  }

  async requestUpload(dto: CreateUploadDto): Promise<UploadResponse> {
    try {
      const response = await firstValueFrom(
        this.http.post<UploadResponse>(`${this.baseUrl}/v1/media/uploads`, dto),
      );

      this.logger.debug({ assetId: response.data.assetId }, 'Forwarded upload request');

      return response.data;
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  async completeUpload(assetId: string, dto: CompleteUploadDto): Promise<MediaAsset> {
    try {
      const response = await firstValueFrom(
        this.http.post<MediaAsset>(`${this.baseUrl}/v1/media/${assetId}/complete`, dto),
      );

      return response.data;
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  async getAsset(assetId: string): Promise<MediaAsset> {
    try {
      const response = await firstValueFrom(
        this.http.get<MediaAsset>(`${this.baseUrl}/v1/media/${assetId}`),
      );

      return response.data;
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  async getDownloadUrl(assetId: string): Promise<DownloadUrlResponse> {
    try {
      const response = await firstValueFrom(
        this.http.get<DownloadUrlResponse>(`${this.baseUrl}/v1/media/${assetId}/download-url`),
      );

      return response.data;
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private toHttpException(error: unknown): HttpException {
    if (this.isAxiosErrorShape(error)) {
      const status =
        typeof error.response?.status === 'number' ? error.response.status : HttpStatus.BAD_GATEWAY;
      const payload = error.response?.data ?? error.message;

      this.logger.warn(
        {
          status,
          message: error.message,
          response: payload,
          url: error.config?.url,
          method: error.config?.method,
        },
        'Media service request failed',
      );

      if (typeof payload === 'string') {
        return new HttpException(payload, status);
      }

      if (payload && typeof payload === 'object') {
        return new HttpException(payload as Record<string, unknown>, status);
      }

      return new HttpException(error.message ?? 'Media service error', status);
    }

    this.logger.error({ error }, 'Unexpected error proxying media request');
    return new HttpException('Upstream service error', HttpStatus.BAD_GATEWAY);
  }

  private isAxiosErrorShape(error: unknown): error is {
    isAxiosError?: boolean;
    response?: { status?: number; data?: unknown };
    message: string;
    config?: { url?: string; method?: string };
  } {
    if (typeof error !== 'object' || error === null) {
      return false;
    }

    const candidate = error as {
      isAxiosError?: boolean;
      response?: { status?: number; data?: unknown };
      message?: unknown;
    };

    return candidate.isAxiosError === true && typeof candidate.message === 'string';
  }
}
