import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@opensearch-project/opensearch';

import { createChildLogger } from '@cartrader/logger';

import { SearchServiceEnv } from '../../config/environment';
import { IndexListingDto } from './dto/index-listing.dto';
import { SearchListingsQueryDto } from './dto/search-listings.dto';

export interface SearchHitListing {
  id: string;
  score: number | null;
  source: Record<string, unknown>;
}

export interface SearchListingsResponse {
  items: SearchHitListing[];
  nextCursor: string | null;
  total: number;
}

const DEFAULT_SIZE = 20;
const MAX_SIZE = 100;

interface SearchRequestBody {
  query: Record<string, unknown>;
  sort: Array<Record<string, unknown>>;
  size: number;
  search_after?: (string | number)[];
}

interface SearchResponseBody {
  hits: {
    hits: Array<{
      _id?: string | number;
      _score?: number;
      _source?: unknown;
      sort?: unknown;
    }>;
    total?: { value?: number } | number;
  };
}

@Injectable()
export class SearchService {
  private readonly logger = createChildLogger({ context: SearchService.name });
  private readonly indexName: string;

  constructor(private readonly client: Client, private readonly configService: ConfigService<SearchServiceEnv>) {
    const indexName = this.configService.get<string>('OPENSEARCH_INDEX_LISTINGS', { infer: true });
    if (!indexName) {
      throw new Error('OPENSEARCH_INDEX_LISTINGS is not configured');
    }
    this.indexName = indexName;
  }

  async ensureIndex(): Promise<void> {
    const exists = await this.client.indices.exists({ index: this.indexName });
    if (!exists.body) {
      this.logger.info({ index: this.indexName }, 'Creating OpenSearch index');
      await this.client.indices.create({
        index: this.indexName,
        body: {
          settings: {
            index: {
              number_of_shards: 1,
              number_of_replicas: 1,
            },
          },
          mappings: {
            properties: {
              title: { type: 'text', analyzer: 'standard' },
              description: { type: 'text', analyzer: 'standard' },
              priceCents: { type: 'long' },
              currencyCode: { type: 'keyword' },
              make: { type: 'keyword' },
              model: { type: 'keyword' },
              bodyType: { type: 'keyword' },
              year: { type: 'integer' },
              mileageKm: { type: 'integer' },
              tags: { type: 'keyword' },
              locationCity: { type: 'keyword' },
              locationState: { type: 'keyword' },
              status: { type: 'keyword' },
              sellerId: { type: 'keyword' },
              coordinates: { type: 'geo_point' },
              searchableText: { type: 'text', analyzer: 'standard' },
            },
          },
        },
      });
    }
  }

  async indexListing(dto: IndexListingDto): Promise<void> {
    await this.ensureIndex();

    const document = {
      ...dto,
      priceCents: Number(dto.priceCents),
      year: dto.year ?? null,
      mileageKm: dto.mileageKm ?? null,
      coordinates:
        dto.latitude !== undefined && dto.longitude !== undefined
          ? { lat: dto.latitude, lon: dto.longitude }
          : undefined,
      searchableText: [dto.title, dto.description, dto.make, dto.model, dto.bodyType, dto.locationCity, dto.locationState]
        .filter(Boolean)
        .join(' '),
    };

    try {
      await this.client.index({
        index: this.indexName,
        id: dto.id,
        refresh: 'wait_for',
        body: document,
      });
    } catch (error) {
      this.logger.error({ error }, 'Failed to index listing');
      throw new InternalServerErrorException('Failed to index listing');
    }
  }

  async removeListing(id: string): Promise<void> {
    try {
      await this.client.delete({ index: this.indexName, id, refresh: 'wait_for' });
    } catch (error) {
      if ((error as { statusCode?: number }).statusCode === 404) {
        throw new NotFoundException('Listing not found in index');
      }

      this.logger.error({ error }, 'Failed to remove listing');
      throw new InternalServerErrorException('Failed to remove listing');
    }
  }

  async searchListings(query: SearchListingsQueryDto): Promise<SearchListingsResponse> {
    await this.ensureIndex();

    const size = Math.min(query.size ?? DEFAULT_SIZE, MAX_SIZE);
    const searchRequest = {
      index: this.indexName,
      body: this.buildRequestBody(query, size),
    };

    try {
      const transportResponse = await this.client.search(searchRequest);
      const rawBody: unknown = transportResponse.body;
      if (!this.isSearchResponse(rawBody)) {
        this.logger.error({ body: rawBody }, 'Invalid response from OpenSearch');
        throw new InternalServerErrorException('Search query failed');
      }
      const body = rawBody;

      const hitsMetadata = Array.isArray(body.hits.hits) ? body.hits.hits : [];
      const hits = hitsMetadata.slice();

      let nextCursor: string | null = null;
      if (hits.length > size) {
        const last = hits.pop();
        if (last?.sort && Array.isArray(last.sort)) {
          const sanitizedSort = last.sort.filter(
            (value): value is string | number => typeof value === 'string' || typeof value === 'number',
          );
          if (sanitizedSort.length) {
            nextCursor = this.encodeCursor(sanitizedSort);
          }
        }
      }

      const items: SearchHitListing[] = hits.map((hit) => {
        const source =
          hit._source && typeof hit._source === 'object' ? (hit._source as Record<string, unknown>) : {};
        return {
          id: String(hit._id),
          score: typeof hit._score === 'number' ? hit._score : null,
          source,
        };
      });

      const total = typeof body.hits.total === 'number' ? body.hits.total : body.hits.total?.value ?? 0;

      return { items, nextCursor, total };
    } catch (error) {
      this.logger.error({ error }, 'Search query failed');
      throw new InternalServerErrorException('Search query failed');
    }
  }

  private buildRequestBody(query: SearchListingsQueryDto, size: number): SearchRequestBody {
    const must: Array<Record<string, unknown>> = [];
    const filter: Array<Record<string, unknown>> = [];

    if (query.q) {
      must.push({
        multi_match: {
          query: query.q,
          fields: ['title^3', 'description', 'searchableText'],
          analyzer: 'standard',
        },
      });
    }

    if (query.make) {
      filter.push({ term: { make: query.make } });
    }

    if (query.model) {
      filter.push({ term: { model: query.model } });
    }

    if (query.bodyType) {
      filter.push({ term: { bodyType: query.bodyType } });
    }

    if (query.locationCity) {
      filter.push({ term: { locationCity: query.locationCity } });
    }

    if (query.locationState) {
      filter.push({ term: { locationState: query.locationState } });
    }

    if (query.tags?.length) {
      filter.push({ terms: { tags: query.tags } });
    }

    if (query.priceMin !== undefined || query.priceMax !== undefined) {
      filter.push({
        range: {
          priceCents: {
            gte: query.priceMin,
            lte: query.priceMax,
          },
        },
      });
    }

    if (query.yearMin !== undefined || query.yearMax !== undefined) {
      filter.push({
        range: {
          year: {
            gte: query.yearMin,
            lte: query.yearMax,
          },
        },
      });
    }

    const requestBody: SearchRequestBody = {
      query: {
        bool: {
          must: must.length ? must : [{ match_all: {} }],
          filter,
        },
      },
      sort: [{ _score: 'desc' }, { priceCents: 'asc' }],
      size: size + 1,
      search_after: query.cursor ? this.decodeCursor(query.cursor) : undefined,
    };

    return requestBody;
  }

  private encodeCursor(sort: (string | number)[]): string {
    return Buffer.from(JSON.stringify(sort)).toString('base64url');
  }

  private decodeCursor(cursor: string): (string | number)[] | undefined {
    try {
      const decoded = Buffer.from(cursor, 'base64url').toString('utf-8');
      const parsed = JSON.parse(decoded);
      if (Array.isArray(parsed) && parsed.every((value) => typeof value === 'string' || typeof value === 'number')) {
        return parsed as (string | number)[];
      }
    } catch (error) {
      this.logger.warn({ error }, 'Invalid cursor provided');
    }

    return undefined;
  }

  private isSearchResponse(payload: unknown): payload is SearchResponseBody {
    if (!payload || typeof payload !== 'object') {
      return false;
    }

    if (!('hits' in payload)) {
      return false;
    }

    const hitsContainer = (payload as { hits?: unknown }).hits;
    return !!hitsContainer && typeof hitsContainer === 'object';
  }
}
