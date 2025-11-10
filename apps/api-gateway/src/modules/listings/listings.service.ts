import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import { createChildLogger } from '@cartrader/logger';

import { loadApiGatewayConfig } from '../../config/environment';
import { CreateListingDto } from './dto/create-listing.dto';
import { ListListingsQueryDto } from './dto/list-listings.dto';
import { ListModerationLogsQueryDto } from './dto/list-moderation-logs.dto';
import { ModerateListingDto } from './dto/moderate-listing.dto';
import { SubmitListingDto } from './dto/submit-listing.dto';

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
  action: string;
  reason: string | null;
  actorId: string | null;
  createdAt: string;
}
type AxiosErrorShape = {
  isAxiosError?: boolean;
  response?: {
    status?: number;
    data?: unknown;
  };
  message: string;
  config?: {
    url?: string;
    method?: string;
  };
};

@Injectable()
export class ListingsService {
  private readonly logger = createChildLogger({ context: ListingsService.name });
  private readonly baseUrl: string;

  constructor(private readonly http: HttpService) {
    const { LISTINGS_SERVICE_BASE_URL } = loadApiGatewayConfig();
    this.baseUrl = LISTINGS_SERVICE_BASE_URL.replace(/\/$/, '');
  }

  async createListing(dto: CreateListingDto): Promise<PublicListing> {
    try {
      const response = await firstValueFrom(
        this.http.post<PublicListing>(`${this.baseUrl}/v1/listings`, dto),
      );

      this.logger.info({ listingId: response.data.id }, 'Forwarded listing creation');

      return response.data;
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  async getListing(id: string): Promise<PublicListing> {
    try {
      const response = await firstValueFrom(
        this.http.get<PublicListing>(`${this.baseUrl}/v1/listings/${id}`),
      );

      return response.data;
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  async listListings(query: ListListingsQueryDto): Promise<PaginatedListings> {
    try {
      const response = await firstValueFrom(
        this.http.get<PaginatedListings>(`${this.baseUrl}/v1/listings`, {
          params: query,
        }),
      );

      return response.data;
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  async submitListing(id: string, dto: SubmitListingDto): Promise<PublicListing> {
    try {
      const response = await firstValueFrom(
        this.http.post<PublicListing>(`${this.baseUrl}/v1/listings/${id}/submit`, dto),
      );

      return response.data;
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  async approveListing(id: string, dto: ModerateListingDto): Promise<PublicListing> {
    return this.moderateListing(`${this.baseUrl}/v1/admin/listings/${id}/approve`, dto);
  }

  async rejectListing(id: string, dto: ModerateListingDto): Promise<PublicListing> {
    return this.moderateListing(`${this.baseUrl}/v1/admin/listings/${id}/reject`, dto);
  }

  async suspendListing(id: string, dto: ModerateListingDto): Promise<PublicListing> {
    return this.moderateListing(`${this.baseUrl}/v1/admin/listings/${id}/suspend`, dto);
  }

  async reinstateListing(id: string, dto: ModerateListingDto): Promise<PublicListing> {
    return this.moderateListing(`${this.baseUrl}/v1/admin/listings/${id}/reinstate`, dto);
  }

  async getModerationLogs(
    id: string,
    query: ListModerationLogsQueryDto,
  ): Promise<ListingModerationLogEntry[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<ListingModerationLogEntry[]>(
          `${this.baseUrl}/v1/admin/listings/${id}/moderation/logs`,
          { params: query },
        ),
      );

      return response.data;
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private async moderateListing(
    url: string,
    dto: ModerateListingDto,
  ): Promise<PublicListing> {
    try {
      const response = await firstValueFrom(this.http.post<PublicListing>(url, dto));
      return response.data;
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private toHttpException(error: unknown): HttpException {
    if (this.isAxiosErrorShape(error)) {
      return this.fromAxiosError(error);
    }

    this.logger.error({ error }, 'Unexpected error proxying listings request');
    return new HttpException('Upstream service error', HttpStatus.BAD_GATEWAY);
  }

  private fromAxiosError(error: AxiosErrorShape): HttpException {
    const status =
      typeof error.response?.status === 'number' ? error.response.status : HttpStatus.BAD_GATEWAY;
    const payload = error.response?.data ?? error.message;
    const url = typeof error.config?.url === 'string' ? error.config.url : undefined;
    const method = typeof error.config?.method === 'string' ? error.config.method : undefined;

    this.logger.warn(
      {
        status,
        message: error.message,
        response: payload,
        url,
        method,
      },
      'Listings service request failed',
    );

    if (typeof payload === 'string') {
      return new HttpException(payload, status);
    }

    if (payload && typeof payload === 'object') {
      return new HttpException(payload as Record<string, unknown>, status);
    }

    return new HttpException(error.message ?? 'Listings service error', status);
  }

  private isAxiosErrorShape(error: unknown): error is AxiosErrorShape {
    if (typeof error !== 'object' || error === null) {
      return false;
    }

    const candidate = error as Partial<AxiosErrorShape>;
    return candidate.isAxiosError === true && typeof candidate.message === 'string';
  }
}
