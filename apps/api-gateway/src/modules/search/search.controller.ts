import { Controller, Get, Query } from '@nestjs/common';

import { SearchListingsQueryDto } from './dto/search-listings.dto';
import { SearchService } from './search.service';

@Controller({ path: 'search', version: '1' })
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('listings')
  searchListings(@Query() query: SearchListingsQueryDto) {
    return this.searchService.searchListings(query);
  }
}
