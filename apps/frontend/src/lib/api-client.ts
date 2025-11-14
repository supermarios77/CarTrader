/**
 * API Client - Production-ready HTTP client for backend communication
 * Handles authentication, error handling, and request/response interceptors
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ApiError {
  message: string | string[];
  statusCode?: number;
  error?: string;
}

export class ApiClientError extends Error {
  constructor(
    public message: string,
    public statusCode?: number,
    public errors?: string[],
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

/**
 * Get stored access token
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

/**
 * Get stored refresh token
 */
function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
}

/**
 * Store tokens
 */
export function storeTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

/**
 * Clear tokens
 */
export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

/**
 * Refresh access token
 */
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      clearTokens();
      return null;
    }

    const data = await response.json();
    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
      return data.accessToken;
    }
  } catch {
    clearTokens();
    return null;
  }

  return null;
}

/**
 * Make API request with automatic token refresh
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const accessToken = getAccessToken();

  // Prepare headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Add auth token if available
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  // Make request
  let response = await fetch(url, {
    ...options,
    headers: headers as HeadersInit,
    credentials: 'include',
  });

  // If 401 and we have a refresh token, try to refresh
  if (response.status === 401 && getRefreshToken()) {
    const newAccessToken = await refreshAccessToken();
    if (newAccessToken) {
      // Retry original request with new token
      headers['Authorization'] = `Bearer ${newAccessToken}`;
      response = await fetch(url, {
        ...options,
        headers: headers as HeadersInit,
        credentials: 'include',
      });
    } else {
      // Refresh failed, clear tokens
      clearTokens();
      throw new ApiClientError('Session expired. Please login again.', 401);
    }
  }

  // Parse response
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    let errors: string[] = [];

    if (isJson) {
      try {
        const errorData: ApiError = await response.json();
        if (typeof errorData.message === 'string') {
          errorMessage = errorData.message;
        } else if (Array.isArray(errorData.message)) {
          errors = errorData.message;
          errorMessage = errors[0] || errorMessage;
        }
      } catch {
        // Failed to parse error JSON
      }
    }

    throw new ApiClientError(errorMessage, response.status, errors);
  }

  if (isJson) {
    return response.json();
  }

  return response.text() as unknown as T;
}

/**
 * API Client methods
 */
export const api = {
  /**
   * GET request
   */
  get: <T>(endpoint: string, options?: RequestInit): Promise<T> => {
    return apiRequest<T>(endpoint, { ...options, method: 'GET' });
  },

  /**
   * POST request
   */
  post: <T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> => {
    return apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * PUT request
   */
  put: <T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> => {
    return apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * PATCH request
   */
  patch: <T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> => {
    return apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * DELETE request
   */
  delete: <T>(endpoint: string, options?: RequestInit): Promise<T> => {
    return apiRequest<T>(endpoint, { ...options, method: 'DELETE' });
  },
};

