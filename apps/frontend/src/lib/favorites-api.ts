/**
 * Favorites API - Client functions for favorites endpoints
 */

import { api } from './api-client';
import type { Vehicle, VehicleListResponse } from '@/types/vehicle';

export interface FavoritesResponse extends VehicleListResponse {
  vehicles: Array<Vehicle & { favoritedAt?: string }>;
}

/**
 * Add a vehicle to favorites
 */
export async function addFavorite(vehicleId: string): Promise<void> {
  await api.post(`/favorites/vehicles/${vehicleId}`);
}

/**
 * Remove a vehicle from favorites
 */
export async function removeFavorite(vehicleId: string): Promise<void> {
  await api.delete(`/favorites/vehicles/${vehicleId}`);
}

/**
 * Get user's favorite vehicles
 */
export async function getFavorites(
  page: number = 1,
  limit: number = 20,
): Promise<FavoritesResponse> {
  const params = new URLSearchParams();
  if (page) params.append('page', String(page));
  if (limit) params.append('limit', String(limit));

  return api.get<FavoritesResponse>(`/favorites?${params.toString()}`);
}

/**
 * Check if a vehicle is favorited
 */
export async function checkFavorite(vehicleId: string): Promise<boolean> {
  const response = await api.get<{ isFavorite: boolean }>(
    `/favorites/vehicles/${vehicleId}/check`,
  );
  return response.isFavorite;
}

