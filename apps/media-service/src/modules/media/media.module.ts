import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';

import { DatabaseModule } from '../database/database.module';

import { MediaController } from './media.controller';
import { MediaRepository } from './media.repository';
import { MediaService } from './media.service';
import { MediaServiceEnv } from '../../config/environment';

@Module({
  imports: [ConfigModule, DatabaseModule],
  controllers: [MediaController],
  providers: [
    MediaService,
    MediaRepository,
    {
      provide: S3Client,
      inject: [ConfigService],
      useFactory: (configService: ConfigService<MediaServiceEnv>): S3Client => {
        const endpoint = configService.get('MEDIA_S3_ENDPOINT', { infer: true });
        const region = configService.get('MEDIA_S3_REGION', { infer: true });
        const accessKeyId = configService.get('MEDIA_S3_ACCESS_KEY', { infer: true });
        const secretAccessKey = configService.get('MEDIA_S3_SECRET_KEY', { infer: true });

        if (!endpoint || !region || !accessKeyId || !secretAccessKey) {
          throw new Error('Missing S3 configuration for media service');
        }

        return new S3Client({
          region,
          endpoint,
          forcePathStyle: true,
          credentials: {
            accessKeyId,
            secretAccessKey,
          },
        });
      },
    },
  ],
})
export class MediaModule {}
