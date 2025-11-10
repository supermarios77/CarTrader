import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';

import { IndexListingDto } from './dto/index-listing.dto';
import { SearchListingsQueryDto } from './dto/search-listings.dto';
import { SearchService } from './search.service';

@Controller({ path: 'search', version: '1' })
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post('listings/index')
  async indexListing(@Body() dto: IndexListingDto): Promise<void> {
    await this.searchService.indexListing(dto);
  }

  @Delete('listings/:id')
  async deleteListing(@Param('id') id: string): Promise<void> {
    await this.searchService.removeListing(id);
  }

  @Get('listings')
  searchListings(@Query() query: SearchListingsQueryDto) {
    return this.searchService.searchListings(query);
  }
}
