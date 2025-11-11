import { HeadBucketCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { createChildLogger } from '@cartrader/logger';

import { MediaServiceEnv } from '../config/environment';
import { DatabaseService } from '../modules/database/database.service';

interface HealthStatus {
  status: 'ok';
  timestamp: string;
  details?: Record<string, unknown>;
}

@Injectable()
export class HealthService {
  private readonly logger = createChildLogger({ context: HealthService.name });
  private s3Client: S3Client | null = null;
  private readonly bucket: string;

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService<MediaServiceEnv>,
  ) {
    const bucket = this.configService.get('MEDIA_S3_BUCKET', { infer: true });
    if (!bucket) {
      throw new Error('MEDIA_S3_BUCKET is required');
    }
    this.bucket = bucket;
  }

  getLiveness(): HealthStatus {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  async getReadiness(): Promise<HealthStatus> {
    await this.ensureDatabase();
    await this.ensureObjectStorage();

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      details: {
        database: 'up',
        objectStorage: 'up',
      },
    };
  }

  private async ensureDatabase(): Promise<void> {
    try {
      const prisma = this.databaseService.client as unknown as {
        $queryRaw: (...args: unknown[]) => Promise<unknown>;
      };

      await prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      this.logger.error({ error }, 'Database readiness check failed');
      throw new ServiceUnavailableException('Database unavailable');
    }
  }

  private async ensureObjectStorage(): Promise<void> {
    try {
      const client = this.getS3Client();
      await client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch (error) {
      this.logger.error({ error }, 'Object storage readiness check failed');
      throw new ServiceUnavailableException('Object storage unavailable');
    }
  }

  private getS3Client(): S3Client {
    if (this.s3Client) {
      return this.s3Client;
    }

    const endpoint = this.configService.get('MEDIA_S3_ENDPOINT', { infer: true });
    const region = this.configService.get('MEDIA_S3_REGION', { infer: true });
    const accessKeyId = this.configService.get('MEDIA_S3_ACCESS_KEY', { infer: true });
    const secretAccessKey = this.configService.get('MEDIA_S3_SECRET_KEY', { infer: true });

    if (!endpoint || !region || !accessKeyId || !secretAccessKey) {
      throw new Error('Incomplete S3 configuration');
    }

    this.s3Client = new S3Client({
      region,
      endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    return this.s3Client;
  }
}
