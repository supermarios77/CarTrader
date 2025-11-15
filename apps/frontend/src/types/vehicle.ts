/**
 * Vehicle Types - TypeScript types for vehicle data
 */

export enum VehicleStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  SOLD = 'SOLD',
  EXPIRED = 'EXPIRED',
  SUSPENDED = 'SUSPENDED',
}

export enum TransmissionType {
  MANUAL = 'MANUAL',
  AUTOMATIC = 'AUTOMATIC',
  CVT = 'CVT',
  SEMI_AUTOMATIC = 'SEMI_AUTOMATIC',
}

export enum FuelType {
  PETROL = 'PETROL',
  DIESEL = 'DIESEL',
  HYBRID = 'HYBRID',
  ELECTRIC = 'ELECTRIC',
  CNG = 'CNG',
  LPG = 'LPG',
}

export enum BodyType {
  SEDAN = 'SEDAN',
  HATCHBACK = 'HATCHBACK',
  SUV = 'SUV',
  COUPE = 'COUPE',
  CONVERTIBLE = 'CONVERTIBLE',
  WAGON = 'WAGON',
  VAN = 'VAN',
  PICKUP = 'PICKUP',
  MOTORCYCLE = 'MOTORCYCLE',
  SCOOTER = 'SCOOTER',
  OTHER = 'OTHER',
}

export interface VehicleImage {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  order: number;
  isPrimary: boolean;
  alt: string | null;
}

export interface VehicleFeature {
  id: string;
  name: string;
  value: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Make {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
}

export interface Model {
  id: string;
  name: string;
  slug: string;
}

export interface VehicleOwner {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  city: string | null;
}

export interface Vehicle {
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
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  soldAt: string | null;
  expiresAt: string | null;
  category: Category;
  make: Make;
  model: Model;
  user: VehicleOwner;
  images: VehicleImage[];
  features: VehicleFeature[];
  _count?: {
    favorites: number;
    messages: number;
    reviews: number;
  };
  isFavorite?: boolean;
}

export interface VehicleListResponse {
  vehicles: Vehicle[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateVehicleData {
  categoryId: string;
  makeId: string;
  modelId: string;
  title: string;
  description?: string;
  price: number;
  currency?: string;
  year: number;
  mileage: number;
  mileageUnit?: string;
  transmission: TransmissionType;
  fuelType: FuelType;
  bodyType: BodyType;
  engineCapacity?: number;
  color?: string;
  registrationCity?: string;
  registrationYear?: number;
  city: string;
  province?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  features?: Array<{
    name: string;
    value?: string;
  }>;
}

export interface UpdateVehicleData extends Partial<CreateVehicleData> {
  status?: VehicleStatus;
  imageIdsToDelete?: string[];
}

export interface VehicleFilters {
  page?: number;
  limit?: number;
  categoryId?: string;
  makeId?: string;
  modelId?: string;
  city?: string;
  province?: string;
  status?: VehicleStatus;
  transmission?: TransmissionType;
  fuelType?: FuelType;
  bodyType?: BodyType;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  minMileage?: number;
  maxMileage?: number;
  search?: string;
  featured?: boolean;
  userId?: string;
  sortBy?: 'price' | 'year' | 'mileage' | 'createdAt' | 'views';
  sortOrder?: 'asc' | 'desc';
}

