/**
 * Vehicles API - Client functions for vehicle endpoints
 */

import { api } from './api-client';
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
        const endpoint = `/vehicles${queryString ? `?${queryString}` : ''}`;
        
        return api.get<VehicleListResponse>(endpoint);
}

/**
 * Get single vehicle by ID
 */
export async function getVehicle(id: string): Promise<Vehicle> {
  return api.get<Vehicle>(`/vehicles/${id}`);
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

  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_URL}/vehicles`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      // Don't set Content-Type - browser will set it with boundary for FormData
    },
    body: formData,
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
    },
    body: formData,
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
  return api.delete(`/vehicles/${id}`);
}

/**
 * Publish a draft vehicle
 */
export async function publishVehicle(id: string): Promise<Vehicle> {
  return api.post<Vehicle>(`/vehicles/${id}/publish`);
}

/**
 * Mark vehicle as sold
 */
export async function markVehicleAsSold(id: string, notes?: string): Promise<Vehicle> {
  return api.post<Vehicle>(`/vehicles/${id}/sold`, { notes });
}

