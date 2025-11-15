import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { Public } from '../auth/decorators/public.decorator';
import { GetMakesDto } from './dto/get-makes.dto';
import { GetModelsDto } from './dto/get-models.dto';

@Controller('catalog')
@Public() // Public endpoints - no authentication required
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  /**
   * Get all active categories
   * GET /catalog/categories
   */
  @Get('categories')
  async getCategories() {
    return this.catalogService.getCategories();
  }

  /**
   * Get a single category by ID
   * GET /catalog/categories/:id
   */
  @Get('categories/:id')
  async getCategoryById(@Param('id', ParseUUIDPipe) id: string) {
    return this.catalogService.getCategoryById(id);
  }

  /**
   * Get makes for a category
   * GET /catalog/makes?categoryId=...
   */
  @Get('makes')
  async getMakes(@Query() query: GetMakesDto) {
    return this.catalogService.getMakes(query.categoryId);
  }

  /**
   * Get a single make by ID
   * GET /catalog/makes/:id
   */
  @Get('makes/:id')
  async getMakeById(@Param('id', ParseUUIDPipe) id: string) {
    return this.catalogService.getMakeById(id);
  }

  /**
   * Get models for a make
   * GET /catalog/models?makeId=...
   */
  @Get('models')
  async getModels(@Query() query: GetModelsDto) {
    return this.catalogService.getModels(query.makeId);
  }

  /**
   * Get a single model by ID
   * GET /catalog/models/:id
   */
  @Get('models/:id')
  async getModelById(@Param('id', ParseUUIDPipe) id: string) {
    return this.catalogService.getModelById(id);
  }
}

