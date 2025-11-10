import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';

import { CreateListingDto } from './dto/create-listing.dto';
import { ListListingsQueryDto } from './dto/list-listings.dto';
import { SubmitListingDto } from './dto/submit-listing.dto';
import { ListingsService, PaginatedListings, PublicListing } from './listings.service';

@Controller({ path: 'listings', version: '1' })
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createListing(@Body() dto: CreateListingDto): Promise<PublicListing> {
    return this.listingsService.createListing(dto);
  }

  @Post(':id/submit')
  submitListing(@Param('id') id: string, @Body() dto: SubmitListingDto): Promise<PublicListing> {
    return this.listingsService.submitListing(id, dto);
  }

  @Get(':id')
  getListing(@Param('id') id: string): Promise<PublicListing> {
    return this.listingsService.getListing(id);
  }

  @Get()
  listListings(@Query() query: ListListingsQueryDto): Promise<PaginatedListings> {
    return this.listingsService.listListings(query);
  }
}
