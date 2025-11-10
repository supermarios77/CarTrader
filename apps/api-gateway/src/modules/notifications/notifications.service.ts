import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

import { createChildLogger } from '@cartrader/logger';

import { loadApiGatewayConfig } from '../../config/environment';
import { CreateNotificationDto, CreateTemplateDto, UpdateTemplateDto } from './dto/create-notification.dto';

export interface NotificationRecord {
  id: string;
  templateId: string | null;
  channel: string;
  recipient: string;
  subject: string | null;
  body: string | null;
  payload: Record<string, unknown> | null;
  status: string;
  error: string | null;
  attemptCount: number;
  maxAttempts: number;
  scheduledFor: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationTemplateRecord {
  id: string;
  key: string;
  channel: string;
  subject: string | null;
  body: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = createChildLogger({ context: NotificationsService.name });
  private readonly baseUrl: string;

  constructor(private readonly http: HttpService) {
    const { NOTIFICATIONS_SERVICE_BASE_URL } = loadApiGatewayConfig();
    this.baseUrl = NOTIFICATIONS_SERVICE_BASE_URL.replace(/\/$/, '');
  }

  async enqueue(dto: CreateNotificationDto): Promise<NotificationRecord> {
    try {
      const response = await firstValueFrom(
        this.http.post<NotificationRecord>(`${this.baseUrl}/v1/notifications`, dto),
      );
      return response.data;
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  async getNotification(id: string): Promise<NotificationRecord> {
    try {
      const response = await firstValueFrom(
        this.http.get<NotificationRecord>(`${this.baseUrl}/v1/notifications/${id}`),
      );
      return response.data;
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  async createTemplate(dto: CreateTemplateDto): Promise<NotificationTemplateRecord> {
    try {
      const response = await firstValueFrom(
        this.http.post<NotificationTemplateRecord>(`${this.baseUrl}/v1/notifications/templates`, dto),
      );
      return response.data;
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  async listTemplates(): Promise<NotificationTemplateRecord[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<NotificationTemplateRecord[]>(`${this.baseUrl}/v1/notifications/templates/all/list`),
      );
      return response.data;
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  async updateTemplate(id: string, dto: UpdateTemplateDto): Promise<NotificationTemplateRecord> {
    try {
      const response = await firstValueFrom(
        this.http.put<NotificationTemplateRecord>(`${this.baseUrl}/v1/notifications/templates/${id}`, dto),
      );
      return response.data;
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  async deleteTemplate(id: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete<void>(`${this.baseUrl}/v1/notifications/templates/${id}`),
      );
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
        'Notifications service request failed',
      );

      if (typeof payload === 'string') {
        return new HttpException(payload, status);
      }

      if (payload && typeof payload === 'object') {
        return new HttpException(payload as Record<string, unknown>, status);
      }

      return new HttpException(error.message ?? 'Notifications service error', status);
    }

    this.logger.error({ error }, 'Unexpected error proxying notifications request');
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
