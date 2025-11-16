import { api, ApiClientError } from './api-client';
import type {
  Vehicle,
  VehicleListResponse,
  CreateVehicleData,
  UpdateVehicleData,
  VehicleFilters,
} from '@/types/vehicle';

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

  // Add all vehicle data fields
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (key === 'features' && Array.isArray(value)) {
        // Features need to be sent as JSON
        formData.append(key, JSON.stringify(value));
      } else if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    }
  });

  // Add images
  if (images && images.length > 0) {
    images.forEach((image) => {
      formData.append('images', image);
    });
  }

  // Use api client for consistent error handling and token management
  // Note: api.post doesn't support FormData directly, so we use fetch but with same error handling
  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_URL}/vehicles`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      // Don't set Content-Type - browser will set it with boundary for FormData
      'Connection': 'keep-alive',
    },
    body: formData,
    credentials: 'include',
    cache: 'no-cache',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create vehicle' }));
    throw new Error(error.message || 'Failed to create vehicle');
  }

  return response.json();
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

  // Add all vehicle data fields
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (key === 'features' && Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (key === 'imageIdsToDelete' && Array.isArray(value)) {
        // Send image IDs to delete as JSON array
        formData.append(key, JSON.stringify(value));
      } else if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    }
  });

  // Add images
  if (images && images.length > 0) {
    images.forEach((image) => {
      formData.append('images', image);
    });
  }

  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_URL}/vehicles/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Connection': 'keep-alive',
    },
    body: formData,
    credentials: 'include',
    cache: 'no-cache',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update vehicle' }));
    throw new Error(error.message || 'Failed to update vehicle');
  }

  return response.json();
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
  // Try standard path, then /api prefix if needed
  try {
    const resp = await getVehicles({ featured: true, limit });
    return Array.isArray((resp as any).vehicles) ? resp.vehicles : [];
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('getFeaturedVehicles error:', e);
    }
    throw e;
  }
}

