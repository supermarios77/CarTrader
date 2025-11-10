import { Injectable } from '@nestjs/common';
import type { PrismaClient, Prisma, NotificationTemplate } from '@prisma/client';

import { DatabaseService } from '../database/database.service';

export type NotificationRecord = Prisma.NotificationGetPayload<{ include: { template: true } }>;
export type NotificationTemplateRecord = NotificationTemplate;
type NotificationCreateArgs = Prisma.NotificationCreateArgs;
type NotificationUpdateArgs = Prisma.NotificationUpdateArgs;
type TemplateCreateArgs = Prisma.NotificationTemplateCreateArgs;
type TemplateUpdateArgs = Prisma.NotificationTemplateUpdateArgs;

@Injectable()
export class NotificationsRepository {
  constructor(private readonly database: DatabaseService) {}

  private get prisma(): PrismaClient {
    return this.database.client as unknown as PrismaClient;
  }

  async createNotification(data: NotificationCreateArgs['data']): Promise<NotificationRecord> {
    return this.prisma.notification.create({ data, include: { template: true } });
  }

  async updateNotification(id: bigint, data: NotificationUpdateArgs['data']): Promise<NotificationRecord> {
    return this.prisma.notification.update({ where: { id }, data, include: { template: true } });
  }

  async findNotificationById(id: bigint): Promise<NotificationRecord | null> {
    return this.prisma.notification.findUnique({ where: { id }, include: { template: true } });
  }

  async createTemplate(data: TemplateCreateArgs['data']): Promise<NotificationTemplateRecord> {
    return this.prisma.notificationTemplate.create({ data });
  }

  async updateTemplate(id: bigint, data: TemplateUpdateArgs['data']): Promise<NotificationTemplateRecord> {
    return this.prisma.notificationTemplate.update({ where: { id }, data });
  }

  async findTemplateByKey(key: string): Promise<NotificationTemplateRecord | null> {
    return this.prisma.notificationTemplate.findUnique({ where: { key } });
  }

  async deleteTemplate(id: bigint): Promise<NotificationTemplateRecord> {
    return this.prisma.notificationTemplate.delete({ where: { id } });
  }

  async listTemplates(): Promise<NotificationTemplateRecord[]> {
    const templates = await this.prisma.notificationTemplate.findMany({ orderBy: { key: 'asc' } });
    return templates;
  }
}
