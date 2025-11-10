import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { NotificationChannel } from '@prisma/client';

import { createChildLogger } from '@cartrader/logger';

import { NotificationsService } from './notifications.service';
import { NotificationsRepository } from './notifications.repository';
import { EmailProvider } from './providers/email/email.provider';

interface QueuePayload {
  notificationId: string;
}

@Injectable()
@Processor('notifications', { concurrency: 5 })
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = createChildLogger({ context: NotificationsProcessor.name });

  constructor(
    private readonly service: NotificationsService,
    private readonly repository: NotificationsRepository,
    private readonly emailProvider: EmailProvider,
  ) {
    super();
  }

  override async process(job: Job<QueuePayload>): Promise<void> {
    const { notificationId } = job.data;
    const id = BigInt(notificationId);

    const record = await this.repository.findNotificationById(id);

    if (!record) {
      this.logger.warn({ notificationId }, 'Notification not found, skipping');
      return;
    }

    const updated = await this.service.incrementAttempt(id);

    try {
      switch (record.channel) {
        case NotificationChannel.EMAIL:
          await this.handleEmail(record);
          break;
        default:
          throw new Error(`Unsupported channel: ${record.channel}`);
      }

      await this.service.markAsDelivered(id);
      this.logger.info({ notificationId }, 'Notification delivered');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      await this.service.markAsFailed(id, message);

      this.logger.error({ notificationId, error: message }, 'Notification delivery failed');

      if (updated.attemptCount + 1 >= updated.maxAttempts) {
        throw error instanceof Error ? error : new Error(message);
      } else {
        throw error instanceof Error ? error : new Error(message);
      }
    }
  }

  private async handleEmail(record: Awaited<ReturnType<NotificationsRepository['findNotificationById']>>): Promise<void> {
    if (!record) {
      return;
    }

    const body = this.renderBody(record);

    await this.emailProvider.send({
      to: record.recipient,
      subject: record.subject ?? undefined,
      html: body,
      text: body,
    });
  }

  private renderBody(record: NonNullable<Awaited<ReturnType<NotificationsRepository['findNotificationById']>>>): string {
    if (record.body) {
      return record.body;
    }

    if (record.template?.body) {
      return record.template.body;
    }

    return JSON.stringify(record.payload ?? {});
  }
}
