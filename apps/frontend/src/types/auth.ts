/**
 * Auth types - TypeScript interfaces for authentication
 */

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone?: string | null;
  phoneVerified?: boolean;
  role: string;
  emailVerified: boolean;
  avatar?: string | null;
  bio?: string | null;
  location?: string | null;
  city?: string | null;
  country?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

