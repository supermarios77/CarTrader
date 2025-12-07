import { useCallback } from 'react';
import { useToast } from '@/components/ui/toast';
import { getUserFriendlyError, logError } from '@/lib/error-utils';
import { ApiClientError } from '@/lib/api-client';

/**
 * Hook for handling errors with user-friendly messages and toast notifications
 */
export function useErrorHandler() {
  const toast = useToast();

  const handleError = useCallback(
    (error: unknown, options?: {
      showToast?: boolean;
      logError?: boolean;
      customMessage?: string;
      onError?: (errorDetails: ReturnType<typeof getUserFriendlyError>) => void;
    }) => {
      const {
        showToast = true,
        logError: shouldLog = true,
        customMessage,
        onError,
      } = options || {};

      const errorDetails = getUserFriendlyError(error);

      // Log error if enabled
      if (shouldLog) {
        logError(error, {
          customMessage,
          errorDetails,
        });
      }

      // Show toast notification if enabled
      if (showToast) {
        const message = customMessage || errorDetails.userMessage;
        
        // Don't show toast for 401 errors (handled by auth context)
        if (error instanceof ApiClientError && error.statusCode === 401) {
          return;
        }

        toast.error(message);
      }

      // Call custom error handler if provided
      onError?.(errorDetails);

      return errorDetails;
    },
    [toast]
  );

  const handleAsyncError = useCallback(
    async <T,>(
      asyncFn: () => Promise<T>,
      options?: Parameters<typeof handleError>[1]
    ): Promise<T | null> => {
      try {
        return await asyncFn();
      } catch (error) {
        handleError(error, options);
        return null;
      }
    },
    [handleError]
  );

  return {
    handleError,
    handleAsyncError,
  };
}

