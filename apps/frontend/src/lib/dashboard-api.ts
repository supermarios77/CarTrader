/**
 * Dashboard API - Client functions for dashboard endpoints
 */

import { api } from './api-client';
import type { Vehicle } from '@/types/vehicle';

export interface DashboardStats {
  totalVehicles: number;
  activeVehicles: number;
  draftVehicles: number;
  soldVehicles: number;
  totalFavorites: number;
  totalViews: number;
  averageViews: number;
}

export interface DashboardVehicle {
  id: string;
  title: string;
  price: number;
  currency: string;
  status: string;
  views: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  make: {
    id: string;
    name: string;
    slug: string;
  };
  model: {
    id: string;
    name: string;
    slug: string;
  };
  images: Array<{
    id: string;
    url: string;
    alt: string | null;
  }>;
  _count: {
    favorites: number;
    messages: number;
    reviews: number;
  };
}

export interface DashboardResponse {
  stats: DashboardStats;
  recentVehicles: DashboardVehicle[];
}

/**
 * Get user dashboard data
 */
export async function getDashboard(): Promise<DashboardResponse> {
  return api.get<DashboardResponse>('/dashboard');
}

