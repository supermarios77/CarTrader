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
 * Make API request with automatic token refresh and retry logic
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  retries = 2,
  timeout = 30000, // 30 seconds default timeout
): Promise<T> {
  // Ensure URL uses HTTP (not HTTPS) to avoid ALPN negotiation issues
  let url = `${API_URL}${endpoint}`;
  url = url.replace(/^https:/, 'http:');
  
  const accessToken = getAccessToken();

  // Prepare headers
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  // Only set JSON content-type when body is not FormData
  const isFormData = typeof window !== 'undefined' && options.body instanceof FormData;
  if (!isFormData) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  // Add auth token if available
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const makeRequest = async (): Promise<Response> => {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
    ...options,
    headers: headers as HeadersInit,
    credentials: 'include',
    cache: 'no-cache',
    keepalive: true,
        signal: controller.signal,
  });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiClientError('Request timeout. Please try again.', 408);
      }
      throw error;
    }
  };

  // Make request with retry logic
  let response: Response;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      try {
        response = await makeRequest();
      } catch (error) {
        // Handle timeout and network errors
        if (error instanceof ApiClientError && error.statusCode === 408) {
          // Timeout - retry if attempts remaining
          if (attempt < retries) {
            const delay = Math.pow(2, attempt) * 1000;
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }
        }
        throw error;
      }

  // If 401 and we have a refresh token, try to refresh
  if (response.status === 401 && getRefreshToken()) {
    const newAccessToken = await refreshAccessToken();
    if (newAccessToken) {
      // Retry original request with new token
      headers['Authorization'] = `Bearer ${newAccessToken}`;
          try {
            response = await makeRequest();
          } catch (error) {
            if (error instanceof ApiClientError && error.statusCode === 408 && attempt < retries) {
              const delay = Math.pow(2, attempt) * 1000;
              await new Promise((resolve) => setTimeout(resolve, delay));
              continue;
            }
            throw error;
          }
    } else {
      // Refresh failed, clear tokens
      clearTokens();
      throw new ApiClientError('Session expired. Please login again.', 401);
    }
  }

  // Handle 204 No Content (successful DELETE, etc.)
  if (response.status === 204) {
    return null as unknown as T;
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

        // Retry on server errors (5xx) or rate limiting (429)
        const shouldRetry = 
          (response.status >= 500 && response.status < 600) || 
          response.status === 429;

        if (shouldRetry && attempt < retries) {
          // Exponential backoff: wait 1s, 2s, 4s
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

    throw new ApiClientError(errorMessage, response.status, errors);
  }

  if (isJson) {
    return response.json();
  }

  return response.text() as unknown as T;
    } catch (error) {
      lastError = error as Error;

      // Don't retry on client errors (4xx) except 429
      if (error instanceof ApiClientError) {
        if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 429) {
          throw error;
        }
      }

      // Retry on network errors
      if (attempt < retries && (error instanceof TypeError || error instanceof Error)) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      throw error;
    }
  }

  // Should never reach here, but TypeScript needs it
  throw lastError || new Error('Request failed after retries');
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

  /**
   * Upload with FormData (POST/PUT)
   */
  upload: async <T>(endpoint: string, formData: FormData, method: 'POST' | 'PUT' = 'POST'): Promise<T> => {
    return apiRequest<T>(endpoint, {
      method,
      body: formData,
      // Do not set Content-Type; browser will set boundary
    });
  },
};

