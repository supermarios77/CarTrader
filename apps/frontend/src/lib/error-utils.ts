/**
 * Error Utilities
 * Provides user-friendly error messages and error logging
 */

import { ApiClientError } from './api-client';

export interface ErrorDetails {
  message: string;
  userMessage: string;
  code?: string;
  statusCode?: number;
  retryable?: boolean;
}

/**
 * Get user-friendly error message from various error types
 */
export function getUserFriendlyError(error: unknown): ErrorDetails {
  // Handle ApiClientError
  if (error instanceof ApiClientError) {
    return getApiErrorDetails(error);
  }

  // Handle standard Error
  if (error instanceof Error) {
    return {
      message: error.message,
      userMessage: getGenericUserMessage(error.message),
      retryable: isRetryableError(error),
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      message: error,
      userMessage: getGenericUserMessage(error),
      retryable: false,
    };
  }

  // Unknown error type
  return {
    message: 'An unknown error occurred',
    userMessage: 'Something went wrong. Please try again later.',
    retryable: false,
  };
}

/**
 * Get user-friendly message for API errors
 */
function getApiErrorDetails(error: ApiClientError): ErrorDetails {
  const statusCode = error.statusCode;
  const message = error.message;
  const errors = error.errors || [];

  // Network errors
  if (message.includes('fetch') || message.includes('network') || message.includes('Failed to fetch')) {
    return {
      message: 'Network error',
      userMessage: 'Unable to connect to the server. Please check your internet connection and try again.',
      code: 'NETWORK_ERROR',
      statusCode,
      retryable: true,
    };
  }

  // HTTP status code based messages
  switch (statusCode) {
    case 400:
      return {
        message: errors.length > 0 ? errors.join(', ') : message,
        userMessage: errors.length > 0 
          ? errors.join('. ') 
          : 'Invalid request. Please check your input and try again.',
        code: 'BAD_REQUEST',
        statusCode,
        retryable: false,
      };

    case 401:
      return {
        message: 'Unauthorized',
        userMessage: 'Your session has expired. Please log in again.',
        code: 'UNAUTHORIZED',
        statusCode,
        retryable: false,
      };

    case 403:
      return {
        message: 'Forbidden',
        userMessage: 'You do not have permission to perform this action.',
        code: 'FORBIDDEN',
        statusCode,
        retryable: false,
      };

    case 404:
      return {
        message: 'Not found',
        userMessage: 'The requested resource was not found.',
        code: 'NOT_FOUND',
        statusCode,
        retryable: false,
      };

    case 409:
      return {
        message: errors.length > 0 ? errors.join(', ') : message,
        userMessage: errors.length > 0 
          ? errors.join('. ') 
          : 'This action conflicts with existing data. Please check and try again.',
        code: 'CONFLICT',
        statusCode,
        retryable: false,
      };

    case 422:
      return {
        message: errors.length > 0 ? errors.join(', ') : message,
        userMessage: errors.length > 0 
          ? errors.join('. ') 
          : 'Please check your input and try again.',
        code: 'VALIDATION_ERROR',
        statusCode,
        retryable: false,
      };

    case 429:
      return {
        message: 'Too many requests',
        userMessage: 'You are making requests too quickly. Please wait a moment and try again.',
        code: 'RATE_LIMIT',
        statusCode,
        retryable: true,
      };

    case 500:
    case 502:
    case 503:
    case 504:
      return {
        message: 'Server error',
        userMessage: 'Our servers are experiencing issues. Please try again in a few moments.',
        code: 'SERVER_ERROR',
        statusCode,
        retryable: true,
      };

    default:
      return {
        message: message || 'An error occurred',
        userMessage: getGenericUserMessage(message),
        statusCode,
        retryable: statusCode ? statusCode >= 500 : false,
      };
  }
}

/**
 * Get generic user-friendly message
 */
function getGenericUserMessage(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('timeout')) {
    return 'The request took too long. Please try again.';
  }

  if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }

  if (lowerMessage.includes('permission') || lowerMessage.includes('unauthorized')) {
    return 'You do not have permission to perform this action.';
  }

  if (lowerMessage.includes('not found')) {
    return 'The requested resource was not found.';
  }

  if (lowerMessage.includes('validation') || lowerMessage.includes('invalid')) {
    return 'Please check your input and try again.';
  }

  return 'Something went wrong. Please try again later.';
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase();
  return (
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('fetch failed') ||
    message.includes('connection')
  );
}

/**
 * Log error for monitoring (production)
 */
export function logError(error: Error | unknown, context?: Record<string, unknown>): void {
  const errorDetails = getUserFriendlyError(error);

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', {
      error,
      details: errorDetails,
      context,
    });
  }

  // Log to error tracking service in production
  if (process.env.NODE_ENV === 'production') {
    try {
      // Example: Send to error tracking service
      if (typeof window !== 'undefined') {
        // Integrate with your error tracking service here
        // Example: Sentry, LogRocket, etc.
        if ((window as any).Sentry) {
          (window as any).Sentry.captureException(error, {
            extra: {
              ...context,
              errorDetails,
            },
          });
        }
      }
    } catch (loggingError) {
      // Silently fail if logging service is unavailable
      console.error('Failed to log error to service:', loggingError);
    }
  }
}

/**
 * Format validation errors from API response
 */
export function formatValidationErrors(errors: string[]): string {
  if (errors.length === 0) return '';
  if (errors.length === 1) return errors[0];
  
  return errors
    .map((error, index) => `${index + 1}. ${error}`)
    .join('\n');
}

