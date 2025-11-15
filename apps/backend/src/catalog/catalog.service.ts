import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CatalogService {
  private readonly logger = new Logger(CatalogService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get all active categories
   */
  async getCategories() {
    const categories = await this.prisma.category.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        order: true,
      },
      orderBy: {
        order: 'asc',
      },
    });

    return categories;
  }

  /**
   * Get makes for a specific category
   */
  async getMakes(categoryId: string) {
    // Validate category exists and is active
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true, isActive: true },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (!category.isActive) {
      throw new NotFoundException('Category is not active');
    }

    const makes = await this.prisma.make.findMany({
      where: {
        categoryId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return makes;
  }

  /**
   * Get models for a specific make
   */
  async getModels(makeId: string) {
    // Validate make exists and is active
    const make = await this.prisma.make.findUnique({
      where: { id: makeId },
      select: { id: true, isActive: true },
    });

    if (!make) {
      throw new NotFoundException('Make not found');
    }

    if (!make.isActive) {
      throw new NotFoundException('Make is not active');
    }

    const models = await this.prisma.model.findMany({
      where: {
        makeId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return models;
  }

  /**
   * Get a single category by ID
   */
  async getCategoryById(categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        order: true,
        isActive: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (!category.isActive) {
      throw new NotFoundException('Category is not active');
    }

    return category;
  }

  /**
   * Get a single make by ID
   */
  async getMakeById(makeId: string) {
    const make = await this.prisma.make.findUnique({
      where: { id: makeId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!make) {
      throw new NotFoundException('Make not found');
    }

    if (!make.isActive) {
      throw new NotFoundException('Make is not active');
    }

    return make;
  }

  /**
   * Get a single model by ID
   */
  async getModelById(modelId: string) {
    const model = await this.prisma.model.findUnique({
      where: { id: modelId },
      include: {
        make: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!model) {
      throw new NotFoundException('Model not found');
    }

    return model;
  }
}

