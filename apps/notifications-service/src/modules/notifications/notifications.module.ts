import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueueOptions } from 'bullmq';

import { DatabaseModule } from '../database/database.module';

import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsRepository } from './notifications.repository';
import { NotificationsProcessor } from './notifications.processor';
import { EmailProvider } from './providers/email/email.provider';
import { NotificationsEnv } from '../../config/environment';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<NotificationsEnv>): QueueOptions => {
        const redisUrl = configService.get('REDIS_URL', { infer: true });
        if (!redisUrl) {
          throw new Error('REDIS_URL is required');
        }

        return {
          connection: {
            url: redisUrl,
          },
        } as QueueOptions;
      },
    }),
    BullModule.registerQueue({
      name: 'notifications',
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: false,
      },
    }),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsRepository, NotificationsProcessor, EmailProvider],
})
export class NotificationsModule {}
