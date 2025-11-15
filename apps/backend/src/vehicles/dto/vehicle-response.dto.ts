import {
  Vehicle,
  VehicleStatus,
  TransmissionType,
  FuelType,
  BodyType,
  VehicleImage,
  VehicleFeature,
  Category,
  Make,
  Model,
  User,
} from '@prisma/client';

export interface VehicleWithRelations {
  id: string;
  userId: string;
  categoryId: string;
  makeId: string;
  modelId: string;
  title: string;
  description: string | null;
  price: any; // Decimal from Prisma
  currency: string;
  year: number;
  mileage: number;
  mileageUnit: string;
  transmission: TransmissionType;
  fuelType: FuelType;
  bodyType: BodyType;
  engineCapacity: number | null;
  color: string | null;
  registrationCity: string | null;
  registrationYear: number | null;
  city: string;
  province: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  status: VehicleStatus;
  featured: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  soldAt: Date | null;
  expiresAt: Date | null;
  category: Pick<Category, 'id' | 'name' | 'slug'>;
  make: Pick<Make, 'id' | 'name' | 'slug' | 'logo'>;
  model: Pick<Model, 'id' | 'name' | 'slug'>;
  user: Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'phone' | 'city'>;
  images: VehicleImage[];
  features: VehicleFeature[];
  _count?: {
    favorites: number;
    messages: number;
    reviews: number;
  };
  isFavorite?: boolean;
}

export class VehicleResponseDto {
  id: string;
  userId: string;
  categoryId: string;
  makeId: string;
  modelId: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  year: number;
  mileage: number;
  mileageUnit: string;
  transmission: TransmissionType;
  fuelType: FuelType;
  bodyType: BodyType;
  engineCapacity: number | null;
  color: string | null;
  registrationCity: string | null;
  registrationYear: number | null;
  city: string;
  province: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  status: VehicleStatus;
  featured: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  soldAt: Date | null;
  expiresAt: Date | null;

  // Relations
  category: {
    id: string;
    name: string;
    slug: string;
  };
  make: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
  };
  model: {
    id: string;
    name: string;
    slug: string;
  };
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    city: string | null;
  };
  images: Array<{
    id: string;
    url: string;
    thumbnailUrl: string | null;
    order: number;
    isPrimary: boolean;
    alt: string | null;
  }>;
  features: Array<{
    id: string;
    name: string;
    value: string | null;
  }>;
  _count?: {
    favorites: number;
    messages: number;
    reviews: number;
  };

  // Computed fields
  isFavorite?: boolean;
}

export class VehicleListResponseDto {
  vehicles: VehicleResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

