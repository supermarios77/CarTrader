import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';

import { createChildLogger } from '@cartrader/logger';

import { ListingsServiceEnv } from '../../config/environment';
import { ListingsRepository, ListingRecord } from './listings.repository';

const BATCH_SIZE = 100;

@Injectable()
export class SearchSyncService {
  private readonly logger = createChildLogger({ context: SearchSyncService.name });
  private readonly searchBaseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<ListingsServiceEnv>,
    private readonly listingsRepository: ListingsRepository,
  ) {
    const baseUrl = this.configService.get('SEARCH_SERVICE_BASE_URL', { infer: true });

    if (!baseUrl) {
      throw new Error('SEARCH_SERVICE_BASE_URL is not configured');
    }

    this.searchBaseUrl = baseUrl.replace(/\/$/, '');
  }

  async syncListing(record: ListingRecord): Promise<void> {
    if (record.status === 'PUBLISHED') {
      await this.indexListing(record);
    } else {
      await this.removeListing(record.id.toString());
    }
  }

  @Cron(CronExpression.EVERY_6_HOURS)
  async reconcilePublishedListings(): Promise<void> {
    this.logger.info('Running scheduled published listings reconciliation');

    let lastId: bigint | undefined;
    let totalIndexed = 0;

    while (true) {
      const batch = await this.listingsRepository.findPublishedBatch(lastId, BATCH_SIZE);

      if (!batch.length) {
        break;
      }

      for (const record of batch) {
        try {
          await this.indexListing(record);
          totalIndexed += 1;
        } catch (error) {
          this.logger.error(
            { listingId: record.id.toString(), error },
            'Failed to reconcile listing to search index',
          );
        }
      }

      lastId = batch[batch.length - 1]?.id;

      if (batch.length < BATCH_SIZE) {
        break;
      }
    }

    this.logger.info({ totalIndexed }, 'Search reconciliation completed');
  }

  private async indexListing(record: ListingRecord): Promise<void> {
    const payload = this.toIndexPayload(record);

    try {
      await firstValueFrom(this.httpService.post(`${this.searchBaseUrl}/search/listings/index`, payload));
    } catch (error) {
      this.logger.error(
        { listingId: record.id.toString(), error },
        'Failed to index listing in search service',
      );
      throw error;
    }
  }

  private async removeListing(id: string): Promise<void> {
    try {
      await firstValueFrom(this.httpService.delete(`${this.searchBaseUrl}/search/listings/${id}`));
    } catch (error) {
      if (this.isNotFoundError(error)) {
        this.logger.debug({ listingId: id }, 'Listing already absent from search index');
        return;
      }

      this.logger.error({ listingId: id, error }, 'Failed to remove listing from search service');
      throw error;
    }
  }

  private toIndexPayload(record: ListingRecord) {
    const tags = new Set<string>();

    [record.type, record.make, record.model, record.bodyType]
      .filter((value): value is string => typeof value === 'string' && value.length > 0)
      .forEach((value) => tags.add(value));

    const featureValues = this.extractFeatures(record.features);
    featureValues.forEach((feature) => tags.add(feature));

    return {
      id: record.id.toString(),
      title: record.title,
      description: record.description,
      priceCents: Number(record.priceCents),
      currencyCode: record.currencyCode,
      make: record.make ?? undefined,
      model: record.model ?? undefined,
      bodyType: record.bodyType ?? undefined,
      year: record.year ?? undefined,
      mileageKm: record.mileageKm ?? undefined,
      tags: Array.from(tags),
      locationCity: record.locationCity ?? undefined,
      locationState: record.locationState ?? undefined,
      latitude: this.toNullableNumber(record.locationLatitude) ?? undefined,
      longitude: this.toNullableNumber(record.locationLongitude) ?? undefined,
      status: record.status,
      sellerId: record.sellerId.toString(),
    };
  }

  private extractFeatures(features: ListingRecord['features']): string[] {
    if (!features) {
      return [];
    }

    if (Array.isArray(features)) {
      return features.filter((item): item is string => typeof item === 'string');
    }

    if (typeof features === 'object') {
      return Object.values(features)
        .filter((value): value is string => typeof value === 'string')
        .map((value) => value);
    }

    return [];
  }

  private toNullableNumber(value: unknown): number | null {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'bigint') {
      return Number(value);
    }

    if (
      typeof value === 'object' &&
      value !== null &&
      'toNumber' in value &&
      typeof (value as { toNumber: () => number }).toNumber === 'function'
    ) {
      try {
        return (value as { toNumber: () => number }).toNumber();
      } catch {
        return null;
      }
    }

    return null;
  }

  private isNotFoundError(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) {
      return false;
    }

    const candidate = error as { response?: { status?: number } };
    return candidate.response?.status === 404;
  }
}
