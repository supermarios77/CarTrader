import { Injectable } from '@nestjs/common';

import { ListingStatus } from '@prisma/client';

import { DatabaseService } from '../database/database.service';

export interface ListingMediaRecord {
  id: bigint;
  listingId: bigint;
  type: string;
  url: string;
  storageKey: string;
  sortOrder: number;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

export interface ListingRecord {
  id: bigint;
  sellerId: bigint;
  title: string;
  description: string;
  priceCents: bigint;
  currencyCode: string;
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
  features: Record<string, unknown> | string[] | null;
  locationCity: string | null;
  locationState: string | null;
  locationLatitude: unknown;
  locationLongitude: unknown;
  publishedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  media: ListingMediaRecord[];
}

type PrismaArgs = Record<string, unknown>;

type PrismaListingDelegate = {
  create(args: PrismaArgs): Promise<ListingRecord>;
  findUnique(args: PrismaArgs): Promise<ListingRecord | null>;
  findMany(args: PrismaArgs): Promise<ListingRecord[]>;
  update(args: PrismaArgs): Promise<ListingRecord>;
};

type PrismaClientLike = {
  listing: PrismaListingDelegate;
};

export interface CreateListingInput {
  sellerId: bigint;
  title: string;
  description: string;
  priceCents: bigint;
  currencyCode: string;
  type: string;
  year?: number | null;
  make?: string | null;
  model?: string | null;
  variant?: string | null;
  mileageKm?: number | null;
  engineCapacity?: number | null;
  fuelType?: string | null;
  transmission?: string | null;
  bodyType?: string | null;
  exteriorColor?: string | null;
  interiorColor?: string | null;
  vin?: string | null;
  registrationCity?: string | null;
  ownership?: string | null;
  features?: Record<string, unknown> | string[] | null;
  locationCity?: string | null;
  locationState?: string | null;
  locationLatitude?: number | null;
  locationLongitude?: number | null;
  media?: Array<{
    type: string;
    url: string;
    storageKey: string;
    sortOrder: number;
    metadata?: Record<string, unknown>;
  }>;
}

export interface FindListingsOptions {
  take: number;
  cursor?: bigint;
  status?: string;
  type?: string;
  sellerId?: bigint;
  search?: string;
}

@Injectable()
export class ListingsRepository {
  constructor(private readonly database: DatabaseService) {}

  private get prisma(): PrismaClientLike {
    return this.database.client as unknown as PrismaClientLike;
  }

  async createListing(data: CreateListingInput): Promise<ListingRecord> {
    const { media = [], ...listingData } = data;

    const createArgs: PrismaArgs = {
      data: {
        ...listingData,
        media: media.length
          ? {
              create: media.map((item) => ({
                ...item,
                metadata: item.metadata ?? null,
              })),
            }
          : undefined,
      },
      include: {
        media: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    };

    return this.prisma.listing.create(createArgs);
  }

  async updateListingStatus(id: bigint, status: ListingStatus): Promise<ListingRecord> {
    const data: Record<string, unknown> = {
      status,
    };

    if (status === ListingStatus.PUBLISHED) {
      data.publishedAt = new Date();
    } else if (status === ListingStatus.DRAFT) {
      data.publishedAt = null;
    }

    const updateArgs: PrismaArgs = {
      where: { id },
      data,
      include: {
        media: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    };

    return this.prisma.listing.update(updateArgs);
  }

  async findById(id: bigint): Promise<ListingRecord | null> {
    return this.prisma.listing.findUnique({
      where: { id },
      include: {
        media: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }

  async findPublishedBatch(afterId?: bigint, take = 100): Promise<ListingRecord[]> {
    const args: PrismaArgs = {
      take,
      where: { status: ListingStatus.PUBLISHED },
      orderBy: { id: 'asc' },
      include: {
        media: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    };

    if (afterId) {
      args.cursor = { id: afterId };
      args.skip = 1;
    }

    return this.prisma.listing.findMany(args);
  }

  async findMany(options: FindListingsOptions): Promise<ListingRecord[]> {
    const { take, cursor, status, type, sellerId, search } = options;

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (sellerId) {
      where.sellerId = sellerId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const args: PrismaArgs = {
      take,
      orderBy: { createdAt: 'desc' },
      where,
      include: {
        media: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    };

    if (cursor) {
      args.cursor = { id: cursor };
      args.skip = 1;
    }

    return this.prisma.listing.findMany(args);
  }
}
