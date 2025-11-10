import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import { ListModerationLogsQueryDto } from './dto/list-moderation-logs.dto';
import { ModerateListingDto } from './dto/moderate-listing.dto';
import {
  ListingModerationLogEntry,
  ListingsService,
  PublicListing,
} from './listings.service';

@Controller({ path: 'admin/listings', version: '1' })
export class AdminListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Post(':id/approve')
  approveListing(@Param('id') id: string, @Body() dto: ModerateListingDto): Promise<PublicListing> {
    return this.listingsService.approveListing(id, dto);
  }

  @Post(':id/reject')
  rejectListing(@Param('id') id: string, @Body() dto: ModerateListingDto): Promise<PublicListing> {
    return this.listingsService.rejectListing(id, dto);
  }

  @Post(':id/suspend')
  suspendListing(@Param('id') id: string, @Body() dto: ModerateListingDto): Promise<PublicListing> {
    return this.listingsService.suspendListing(id, dto);
  }

  @Post(':id/reinstate')
  reinstateListing(@Param('id') id: string, @Body() dto: ModerateListingDto): Promise<PublicListing> {
    return this.listingsService.reinstateListing(id, dto);
  }

  @Get(':id/moderation/logs')
  getModerationLogs(
    @Param('id') id: string,
    @Query() query: ListModerationLogsQueryDto,
  ): Promise<ListingModerationLogEntry[]> {
    return this.listingsService.getModerationLogs(id, query);
  }
}
