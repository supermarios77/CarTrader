import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationStatus, Prisma } from '@prisma/client';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { createChildLogger } from '@cartrader/logger';

import { NotificationsEnv } from '../../config/environment';
import { CreateNotificationDto, CreateTemplateDto, UpdateTemplateDto } from './dto/create-notification.dto';
import { NotificationsRepository, NotificationRecord, NotificationTemplateRecord } from './notifications.repository';

interface QueuePayload {
  notificationId: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = createChildLogger({ context: NotificationsService.name });
  private readonly queueName: string;

  constructor(
    private readonly repository: NotificationsRepository,
    private readonly configService: ConfigService<NotificationsEnv>,
    @InjectQueue('notifications') private readonly queue: Queue<QueuePayload>,
  ) {
    const queueName = this.configService.get('NOTIFICATIONS_QUEUE_NAME', { infer: true });
    if (!queueName) {
      throw new Error('NOTIFICATIONS_QUEUE_NAME is required');
    }
    this.queueName = queueName;
  }

  async createTemplate(dto: CreateTemplateDto): Promise<NotificationTemplateRecord> {
    const existing = await this.repository.findTemplateByKey(dto.key);
    if (existing) {
      throw new BadRequestException('Template key already exists');
    }

    return this.repository.createTemplate({
      key: dto.key,
      channel: dto.channel,
      subject: dto.subject ?? null,
      body: dto.body,
      description: dto.description ?? null,
    });
  }

  async updateTemplate(id: string, dto: UpdateTemplateDto): Promise<NotificationTemplateRecord> {
    const templateId = this.toBigInt(id, 'templateId');
    return this.repository.updateTemplate(templateId, {
      subject: dto.subject ?? undefined,
      body: dto.body ?? undefined,
      description: dto.description ?? undefined,
    });
  }

  async listTemplates(): Promise<NotificationTemplateRecord[]> {
    return this.repository.listTemplates();
  }

  async deleteTemplate(id: string): Promise<void> {
    const templateId = this.toBigInt(id, 'templateId');
    await this.repository.deleteTemplate(templateId);
  }

  async enqueueNotification(dto: CreateNotificationDto): Promise<NotificationRecord> {
    let template = null;

    if (dto.templateKey) {
      template = await this.repository.findTemplateByKey(dto.templateKey);
      if (!template) {
        throw new NotFoundException('Template not found');
      }
    }

    if (!template && !dto.body) {
      throw new BadRequestException('Provide either a templateKey or body');
    }

    const record = await this.repository.createNotification({
      templateId: template ? template.id : null,
      channel: dto.channel,
      recipient: dto.recipient,
      subject: dto.subject ?? template?.subject ?? null,
      body: dto.body ?? template?.body ?? null,
      payload: dto.payload ? (dto.payload as Prisma.InputJsonValue) : undefined,
      status: NotificationStatus.QUEUED,
      maxAttempts: dto.maxAttempts ?? 3,
      scheduledFor: dto.scheduledFor ?? new Date(),
    });

    await this.queue.add(
      this.queueName,
      { notificationId: record.id.toString() },
      {
        delay: this.calculateDelay(record.scheduledFor),
        attempts: record.maxAttempts,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    this.logger.info({ notificationId: record.id.toString(), channel: record.channel }, 'Notification queued');

    return record;
  }

  async getNotification(id: string): Promise<NotificationRecord> {
    const notificationId = this.toBigInt(id, 'notificationId');
    const record = await this.repository.findNotificationById(notificationId);

    if (!record) {
      throw new NotFoundException('Notification not found');
    }

    return record;
  }

  async markAsDelivered(id: bigint): Promise<void> {
    await this.repository.updateNotification(id, {
      status: NotificationStatus.DELIVERED,
      sentAt: new Date(),
    });
  }

  async markAsFailed(id: bigint, error: string): Promise<void> {
    await this.repository.updateNotification(id, {
      status: NotificationStatus.FAILED,
      error,
    });
  }

  async incrementAttempt(id: bigint): Promise<NotificationRecord> {
    return this.repository.updateNotification(id, {
      attemptCount: { increment: 1 },
    });
  }

  private toBigInt(value: string, field: string): bigint {
    try {
      return BigInt(value);
    } catch {
      throw new BadRequestException(`${field} is not a valid identifier`);
    }
  }

  private calculateDelay(schedule: Date | null): number {
    if (!schedule) {
      return 0;
    }

    const diff = schedule.getTime() - Date.now();
    return diff > 0 ? diff : 0;
  }
}
