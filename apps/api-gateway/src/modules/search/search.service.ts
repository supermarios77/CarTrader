import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

import { createChildLogger } from '@cartrader/logger';

import { loadApiGatewayConfig } from '../../config/environment';
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

@Injectable()
export class SearchService {
  private readonly logger = createChildLogger({ context: SearchService.name });
  private readonly baseUrl: string;

  constructor(private readonly http: HttpService) {
    const { SEARCH_SERVICE_BASE_URL } = loadApiGatewayConfig();
    this.baseUrl = SEARCH_SERVICE_BASE_URL.replace(/\/$/, '');
  }

  async searchListings(query: SearchListingsQueryDto): Promise<SearchListingsResponse> {
    try {
      const response = await firstValueFrom(
        this.http.get<SearchListingsResponse>(`${this.baseUrl}/v1/search/listings`, { params: query }),
      );

      return response.data;
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private toHttpException(error: unknown): HttpException {
    if (this.isAxiosErrorShape(error)) {
      const status =
        typeof error.response?.status === 'number' ? error.response.status : HttpStatus.BAD_GATEWAY;
      const payload = error.response?.data ?? error.message;

      this.logger.warn(
        {
          status,
          message: error.message,
          response: payload,
          url: error.config?.url,
          method: error.config?.method,
        },
        'Search service request failed',
      );

      if (typeof payload === 'string') {
        return new HttpException(payload, status);
      }

      if (payload && typeof payload === 'object') {
        return new HttpException(payload as Record<string, unknown>, status);
      }

      return new HttpException(error.message ?? 'Search service error', status);
    }

    this.logger.error({ error }, 'Unexpected error proxying search request');
    return new HttpException('Upstream service error', HttpStatus.BAD_GATEWAY);
  }

  private isAxiosErrorShape(error: unknown): error is {
    isAxiosError?: boolean;
    response?: { status?: number; data?: unknown };
    message: string;
    config?: { url?: string; method?: string };
  } {
    if (typeof error !== 'object' || error === null) {
      return false;
    }

    const candidate = error as {
      isAxiosError?: boolean;
      response?: { status?: number; data?: unknown };
      message?: unknown;
    };

    return candidate.isAxiosError === true && typeof candidate.message === 'string';
  }
}
