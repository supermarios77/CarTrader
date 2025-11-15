/**
 * Profile API - Client functions for user profile endpoints
 */

import { api } from './api-client';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  phoneVerified: boolean;
  role: string;
  emailVerified: boolean;
  avatar: string | null;
  bio: string | null;
  location: string | null;
  city: string | null;
  country: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  bio?: string | null;
  location?: string | null;
  city?: string | null;
  country?: string | null;
  avatar?: string | null;
}

/**
 * Get user profile
 */
export async function getProfile(): Promise<UserProfile> {
  return api.get<UserProfile>('/auth/me');
}

/**
 * Update user profile
 */
export async function updateProfile(
  data: UpdateProfileData,
): Promise<UserProfile> {
  return api.put<UserProfile>('/auth/profile', data);
}

