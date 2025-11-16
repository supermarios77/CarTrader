import { api, ApiClientError } from './api-client';
import type {
  Vehicle,
  VehicleListResponse,
  CreateVehicleData,
  UpdateVehicleData,
  VehicleFilters,
} from '@/types/vehicle';
import { VehicleStatus } from '@/types/vehicle';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Get all vehicles with filters
 */
export async function getVehicles(filters?: VehicleFilters): Promise<VehicleListResponse> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
  }
  const queryString = params.toString();
  const path = `/vehicles${queryString ? `?${queryString}` : ''}`;

  try {
    return await api.get<VehicleListResponse>(path);
  } catch (e) {
    // Some deployments expose a global /api prefix - retry transparently
    if (e instanceof ApiClientError && e.statusCode === 404) {
      return await api.get<VehicleListResponse>(`/api${path}`);
    }
    throw e;
  }
}

/**
 * Get single vehicle by ID
 */
export async function getVehicle(id: string): Promise<Vehicle> {
  try {
    return await api.get<Vehicle>(`/vehicles/${id}`);
  } catch (e) {
    if (e instanceof ApiClientError && e.statusCode === 404) {
      return await api.get<Vehicle>(`/api/vehicles/${id}`);
    }
    throw e;
  }
}

/**
 * Create a new vehicle listing
 */
export async function createVehicle(
  data: CreateVehicleData,
  images?: File[],
): Promise<Vehicle> {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === 'features' && Array.isArray(value)) {
      // Append as bracketed fields so backend validators see an array, not a JSON string
      if (value.length === 0) return; // omit when empty
      value.forEach((feat: any, idx: number) => {
        if (!feat || typeof feat !== 'object') return;
        if (typeof feat.name === 'string' && feat.name.trim().length > 0) {
          formData.append(`features[${idx}][name]`, feat.name);
        }
        if (typeof feat.value === 'string' && feat.value.trim().length > 0) {
          formData.append(`features[${idx}][value]`, feat.value);
        }
      });
    } else if (typeof value === 'object') {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  });

  if (images && images.length > 0) {
    images.forEach((image) => formData.append('images', image));
  }

  // Use api.upload to leverage auth and refresh handling
  return api.upload<Vehicle>('/vehicles', formData, 'POST');
}

/**
 * Update a vehicle
 */
export async function updateVehicle(
  id: string,
  data: UpdateVehicleData,
  images?: File[],
): Promise<Vehicle> {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === 'features' && Array.isArray(value)) {
      if (value.length > 0) {
        value.forEach((feat: any, idx: number) => {
          if (!feat || typeof feat !== 'object') return;
          if (typeof feat.name === 'string' && feat.name.trim().length > 0) {
            formData.append(`features[${idx}][name]`, feat.name);
          }
          if (typeof feat.value === 'string' && feat.value.trim().length > 0) {
            formData.append(`features[${idx}][value]`, feat.value);
          }
        });
      }
    } else if (key === 'imageIdsToDelete' && Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
    } else if (typeof value === 'object') {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  });

  if (images && images.length > 0) {
    images.forEach((image) => formData.append('images', image));
  }

  return api.upload<Vehicle>(`/vehicles/${id}`, formData, 'PUT');
}

/**
 * Delete a vehicle
 */
export async function deleteVehicle(id: string): Promise<void> {
  try {
    return await api.delete(`/vehicles/${id}`);
  } catch (e) {
    if (e instanceof ApiClientError && e.statusCode === 404) {
      return await api.delete(`/api/vehicles/${id}`);
    }
    throw e;
  }
}

/**
 * Publish a draft vehicle
 */
export async function publishVehicle(id: string): Promise<Vehicle> {
  try {
    return await api.post<Vehicle>(`/vehicles/${id}/publish`);
  } catch (e) {
    if (e instanceof ApiClientError && e.statusCode === 404) {
      return await api.post<Vehicle>(`/api/vehicles/${id}/publish`);
    }
    throw e;
  }
}

/**
 * Mark vehicle as sold
 */
export async function markVehicleAsSold(id: string, notes?: string): Promise<Vehicle> {
  try {
    return await api.post<Vehicle>(`/vehicles/${id}/sold`, { notes });
  } catch (e) {
    if (e instanceof ApiClientError && e.statusCode === 404) {
      return await api.post<Vehicle>(`/api/vehicles/${id}/sold`, { notes });
    }
    throw e;
  }
}

/**
 * Convenience: get featured vehicles list (defaults to 8)
 */
export async function getFeaturedVehicles(limit = 8): Promise<Vehicle[]> {
  // Strict: only return truly featured vehicles; if none or request fails, return []
  try {
    const resp = await getVehicles({ featured: true, limit });
    return Array.isArray((resp as any).vehicles) ? resp.vehicles : [];
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('getFeaturedVehicles failed (strict):', e);
    }
    return [];
  }
}

