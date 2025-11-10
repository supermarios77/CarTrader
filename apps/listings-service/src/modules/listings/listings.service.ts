import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { ListingModerationAction, ListingStatus } from '@prisma/client';

import { createChildLogger } from '@cartrader/logger';

import { CreateListingDto, ListingMediaInputDto } from './dto/create-listing.dto';
import { ListListingsQueryDto } from './dto/list-listings.dto';
import { CreateListingInput, ListingRecord, ListingsRepository } from './listings.repository';
import { SearchSyncService } from './search-sync.service';

export interface PublicListingMedia {
  id: string;
  type: string;
  url: string;
  storageKey: string;
  sortOrder: number;
  metadata: Record<string, unknown> | null;
}

export interface PublicListing {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  price: {
    amountCents: string;
    currencyCode: string;
  };
  status: string;
  type: string;
  year: number | null;
  make: string | null;
  model: string | null;
  variant: string | null;
  mileageKm: number | null;
  engineCapacity: number | null;
  fuelType: string | null;
  transmission: string | null;
  bodyType: string | null;
  exteriorColor: string | null;
  interiorColor: string | null;
  vin: string | null;
  registrationCity: string | null;
  ownership: string | null;
  features: string[] | null;
  location: {
    city: string | null;
    state: string | null;
    latitude: number | null;
    longitude: number | null;
  };
  publishedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  media: PublicListingMedia[];
}

export interface PaginatedListings {
  items: PublicListing[];
  nextCursor: string | null;
}

export interface ListingModerationLogEntry {
  id: string;
  action: ListingModerationAction;
  reason: string | null;
  actorId: string | null;
  createdAt: string;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const toBigInt = (value: string, field: string): bigint => {
  try {
    return BigInt(value);
  } catch {
    throw new BadRequestException(`${field} is not a valid identifier`);
  }
};

const toOptionalBigInt = (value: string | undefined, field: string): bigint | null => {
  if (!value) {
    return null;
  }

  try {
    return BigInt(value);
  } catch {
    throw new BadRequestException(`${field} is not a valid identifier`);
  }
};

const normalizePrice = (value: number): bigint => {
  if (!Number.isInteger(value)) {
    throw new BadRequestException('priceCents must be an integer value');
  }

  if (value < 0) {
    throw new BadRequestException('priceCents must be positive');
  }

  return BigInt(value);
};

const toNullableNumber = (value: unknown): number | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'bigint') {
    return Number(value);
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
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
};

const toSafeString = (input: unknown): string => {
  if (typeof input === 'string') {
    return input;
  }

  if (typeof input === 'number' || typeof input === 'bigint' || typeof input === 'boolean') {
    return input.toString();
  }

  if (input === null || input === undefined) {
    return '';
  }

  try {
    return JSON.stringify(input);
  } catch {
    return Object.prototype.toString.call(input);
  }
};

const normalizeFeatures = (value: ListingRecord['features']): string[] | null => {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    return value.map((item) => toSafeString(item));
  }

  if (typeof value === 'object') {
    return Object.values(value).map((item) => toSafeString(item));
  }

  return null;
};

const toPublicListing = (record: ListingRecord): PublicListing => ({
  id: record.id.toString(),
  sellerId: record.sellerId.toString(),
  title: record.title,
  description: record.description,
  price: {
    amountCents: record.priceCents.toString(),
    currencyCode: record.currencyCode,
  },
  status: record.status,
  type: record.type,
  year: record.year,
  make: record.make,
  model: record.model,
  variant: record.variant,
  mileageKm: record.mileageKm,
  engineCapacity: record.engineCapacity,
  fuelType: record.fuelType,
  transmission: record.transmission,
  bodyType: record.bodyType,
  exteriorColor: record.exteriorColor,
  interiorColor: record.interiorColor,
  vin: record.vin,
  registrationCity: record.registrationCity,
  ownership: record.ownership,
  features: normalizeFeatures(record.features),
  location: {
    city: record.locationCity,
    state: record.locationState,
    latitude: toNullableNumber(record.locationLatitude),
    longitude: toNullableNumber(record.locationLongitude),
  },
  publishedAt: record.publishedAt ? record.publishedAt.toISOString() : null,
  expiresAt: record.expiresAt ? record.expiresAt.toISOString() : null,
  createdAt: record.createdAt.toISOString(),
  updatedAt: record.updatedAt.toISOString(),
  media: record.media
    .map((item) => ({
      id: item.id.toString(),
      type: item.type,
      url: item.url,
      storageKey: item.storageKey,
      sortOrder: item.sortOrder,
      metadata: item.metadata,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder),
});

@Injectable()
export class ListingsService {
  private readonly logger = createChildLogger({ context: ListingsService.name });

  constructor(
    private readonly listingsRepository: ListingsRepository,
    private readonly searchSyncService: SearchSyncService,
  ) {}

  async createListing(dto: CreateListingDto): Promise<PublicListing> {
    const sellerId = toBigInt(dto.sellerId, 'sellerId');
    const priceCents = normalizePrice(dto.priceCents);

    const payload: CreateListingInput = {
      sellerId,
      title: dto.title,
      description: dto.description,
      priceCents,
      currencyCode: dto.currencyCode ?? 'PKR',
      type: dto.type,
      year: dto.year ?? null,
      make: dto.make ?? null,
      model: dto.model ?? null,
      variant: dto.variant ?? null,
      mileageKm: dto.mileageKm ?? null,
      engineCapacity: dto.engineCapacity ?? null,
      fuelType: dto.fuelType ?? null,
      transmission: dto.transmission ?? null,
      bodyType: dto.bodyType ?? null,
      exteriorColor: dto.exteriorColor ?? null,
      interiorColor: dto.interiorColor ?? null,
      vin: dto.vin ?? null,
      registrationCity: dto.registrationCity ?? null,
      ownership: dto.ownership ?? null,
      features: dto.features ?? null,
      locationCity: dto.locationCity ?? null,
      locationState: dto.locationState ?? null,
      locationLatitude: dto.locationLatitude ?? null,
      locationLongitude: dto.locationLongitude ?? null,
      media: dto.media?.map(normalizeMediaInput) ?? [],
    };

    const record = await this.listingsRepository.createListing(payload);

    this.logger.info({ listingId: record.id.toString(), sellerId: record.sellerId.toString() }, 'Listing created');

    if (record.status === ListingStatus.PUBLISHED) {
      await this.searchSyncService.syncListing(record);
    }

    return toPublicListing(record);
  }

  async submitListingForReview(
    id: string,
    actorId?: string,
    reason?: string,
  ): Promise<PublicListing> {
    const { listingId, record } = await this.getListingRecord(id);
    const currentStatus = record.status as ListingStatus;

    if (currentStatus === ListingStatus.PENDING_REVIEW) {
      return toPublicListing(record);
    }

    if (
      currentStatus !== ListingStatus.DRAFT &&
      currentStatus !== ListingStatus.REJECTED &&
      currentStatus !== ListingStatus.SUSPENDED
    ) {
      throw new BadRequestException('Listing cannot be submitted for review in its current state.');
    }

    const updated = await this.listingsRepository.updateListingStatus(
      listingId,
      ListingStatus.PENDING_REVIEW,
    );

    await this.recordModerationAction(updated.id, ListingModerationAction.SUBMITTED, reason, actorId);
    await this.searchSyncService.syncListing(updated);

    return toPublicListing(updated);
  }

  async approveListing(id: string, moderatorId?: string, reason?: string): Promise<PublicListing> {
    const { listingId, record } = await this.getListingRecord(id);
    const currentStatus = record.status as ListingStatus;

    if (currentStatus !== ListingStatus.PENDING_REVIEW && currentStatus !== ListingStatus.REJECTED) {
      throw new BadRequestException('Listing must be pending review or rejected to approve.');
    }

    const updated = await this.listingsRepository.updateListingStatus(
      listingId,
      ListingStatus.PUBLISHED,
    );

    await this.recordModerationAction(updated.id, ListingModerationAction.APPROVED, reason, moderatorId);
    await this.searchSyncService.syncListing(updated);

    return toPublicListing(updated);
  }

  async rejectListing(id: string, moderatorId?: string, reason?: string): Promise<PublicListing> {
    const { listingId, record } = await this.getListingRecord(id);
    const currentStatus = record.status as ListingStatus;

    if (currentStatus !== ListingStatus.PENDING_REVIEW) {
      throw new BadRequestException('Only listings pending review can be rejected.');
    }

    const updated = await this.listingsRepository.updateListingStatus(
      listingId,
      ListingStatus.REJECTED,
    );

    await this.recordModerationAction(updated.id, ListingModerationAction.REJECTED, reason, moderatorId);
    await this.searchSyncService.syncListing(updated);

    return toPublicListing(updated);
  }

  async suspendListing(id: string, moderatorId?: string, reason?: string): Promise<PublicListing> {
    const { listingId, record } = await this.getListingRecord(id);
    const currentStatus = record.status as ListingStatus;

    if (currentStatus !== ListingStatus.PUBLISHED) {
      throw new BadRequestException('Only published listings can be suspended.');
    }

    const updated = await this.listingsRepository.updateListingStatus(
      listingId,
      ListingStatus.SUSPENDED,
    );

    await this.recordModerationAction(updated.id, ListingModerationAction.SUSPENDED, reason, moderatorId);
    await this.searchSyncService.syncListing(updated);

    return toPublicListing(updated);
  }

  async reinstateListing(id: string, moderatorId?: string, reason?: string): Promise<PublicListing> {
    const { listingId, record } = await this.getListingRecord(id);
    const currentStatus = record.status as ListingStatus;

    if (currentStatus !== ListingStatus.SUSPENDED && currentStatus !== ListingStatus.REJECTED) {
      throw new BadRequestException('Only suspended or rejected listings can be reinstated.');
    }

    const updated = await this.listingsRepository.updateListingStatus(
      listingId,
      ListingStatus.PUBLISHED,
    );

    await this.recordModerationAction(updated.id, ListingModerationAction.REINSTATED, reason, moderatorId);
    await this.searchSyncService.syncListing(updated);

    return toPublicListing(updated);
  }

  async getModerationHistory(id: string, limit = 20): Promise<ListingModerationLogEntry[]> {
    const listingId = toBigInt(id, 'listingId');
    const logs = await this.listingsRepository.findModerationLogs(listingId, limit);
    return logs.map(this.toModerationLog);
  }

  async updateListingStatus(id: string, status: ListingStatus): Promise<PublicListing> {
    const listingId = toBigInt(id, 'listingId');
    const record = await this.listingsRepository.findById(listingId);

    if (!record) {
      throw new NotFoundException('Listing not found');
    }

    if (record.status === status) {
      await this.searchSyncService.syncListing(record);
      return toPublicListing(record);
    }

    const updated = await this.listingsRepository.updateListingStatus(listingId, status);

    await this.searchSyncService.syncListing(updated);

    this.logger.info(
      {
        listingId: updated.id.toString(),
        status: updated.status,
      },
      'Listing status updated',
    );

    return toPublicListing(updated);
  }

  async getListingById(id: string): Promise<PublicListing> {
    const listingId = toBigInt(id, 'listingId');

    const record = await this.listingsRepository.findById(listingId);

    if (!record) {
      throw new NotFoundException('Listing not found');
    }

    return toPublicListing(record);
  }

  async listListings(query: ListListingsQueryDto): Promise<PaginatedListings> {
    const limit = Math.min(query.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
    const cursor = query.cursor ? toBigInt(query.cursor, 'cursor') : undefined;
    const take = limit + 1;

    const records = await this.listingsRepository.findMany({
      take,
      cursor,
      status: (query.status ?? ListingStatus.PUBLISHED) as string,
      type: query.type,
      sellerId: query.sellerId ? toBigInt(query.sellerId, 'sellerId') : undefined,
      search: query.search,
    });

    let nextCursor: string | null = null;
    if (records.length > limit) {
      const next = records.pop();
      nextCursor = next ? next.id.toString() : null;
    }

    return {
      items: records.map(toPublicListing),
      nextCursor,
    };
  }

  private async getListingRecord(id: string): Promise<{ listingId: bigint; record: ListingRecord }> {
    const listingId = toBigInt(id, 'listingId');
    const record = await this.listingsRepository.findById(listingId);

    if (!record) {
      throw new NotFoundException('Listing not found');
    }

    return { listingId, record };
  }

  private async recordModerationAction(
    listingId: bigint,
    action: ListingModerationAction,
    reason?: string,
    actorId?: string,
  ): Promise<void> {
    const actorBigInt = toOptionalBigInt(actorId, 'actorId');

    await this.listingsRepository.createModerationLog({
      listingId,
      action,
      reason: reason ?? null,
      actorId: actorBigInt,
    });
  }

  private readonly toModerationLog = (log: {
    id: bigint;
    action: ListingModerationAction;
    reason: string | null;
    actorId: bigint | null;
    createdAt: Date;
  }): ListingModerationLogEntry => ({
    id: log.id.toString(),
    action: log.action,
    reason: log.reason,
    actorId: log.actorId ? log.actorId.toString() : null,
    createdAt: log.createdAt.toISOString(),
  });
}

const normalizeMediaInput = (item: ListingMediaInputDto, index: number) => ({
  type: item.type,
  url: item.url,
  storageKey: item.storageKey,
  sortOrder: item.sortOrder ?? index,
  metadata: item.metadata ?? undefined,
});

