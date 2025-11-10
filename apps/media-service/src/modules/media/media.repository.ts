import { Injectable } from '@nestjs/common';

import { MediaAssetStatus, MediaAssetVisibility } from '@prisma/client';

import { DatabaseService } from '../database/database.service';

export interface MediaAssetRecord {
  id: bigint;
  storageKey: string;
  bucket: string;
  contentType: string | null;
  byteSize: bigint | null;
  checksumSha256: string | null;
  status: MediaAssetStatus;
  visibility: MediaAssetVisibility;
  uploadedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  ownerId: bigint | null;
}

type PrismaArgs = Record<string, unknown>;

type PrismaMediaAssetDelegate = {
  create(args: PrismaArgs): Promise<MediaAssetRecord>;
  update(args: PrismaArgs): Promise<MediaAssetRecord>;
  findUnique(args: PrismaArgs): Promise<MediaAssetRecord | null>;
};

interface PrismaClientLike {
  mediaAsset: PrismaMediaAssetDelegate;
}

export interface CreateMediaAssetInput {
  storageKey: string;
  bucket: string;
  contentType?: string | null;
  byteSize?: bigint | null;
  checksumSha256?: string | null;
  status?: MediaAssetStatus;
  visibility?: MediaAssetVisibility;
  ownerId?: bigint | null;
}

export interface UpdateMediaAssetInput {
  contentType?: string | null;
  byteSize?: bigint | null;
  checksumSha256?: string | null;
  status?: MediaAssetStatus;
  uploadedAt?: Date | null;
}

@Injectable()
export class MediaRepository {
  constructor(private readonly database: DatabaseService) {}

  private get prisma(): PrismaClientLike {
    return this.database.client as unknown as PrismaClientLike;
  }

  async createMediaAsset(input: CreateMediaAssetInput): Promise<MediaAssetRecord> {
    return this.prisma.mediaAsset.create({
      data: {
        storageKey: input.storageKey,
        bucket: input.bucket,
        contentType: input.contentType ?? null,
        byteSize: input.byteSize ?? null,
        checksumSha256: input.checksumSha256 ?? null,
        status: input.status ?? MediaAssetStatus.PENDING,
        visibility: input.visibility ?? MediaAssetVisibility.PRIVATE,
        ownerId: input.ownerId ?? null,
      },
    });
  }

  async updateMediaAsset(id: bigint, input: UpdateMediaAssetInput): Promise<MediaAssetRecord> {
    return this.prisma.mediaAsset.update({
      where: { id },
      data: {
        contentType: input.contentType ?? undefined,
        byteSize: input.byteSize ?? undefined,
        checksumSha256: input.checksumSha256 ?? undefined,
        status: input.status ?? undefined,
        uploadedAt: input.uploadedAt ?? undefined,
      },
    });
  }

  async findById(id: bigint): Promise<MediaAssetRecord | null> {
    return this.prisma.mediaAsset.findUnique({ where: { id } });
  }
}
