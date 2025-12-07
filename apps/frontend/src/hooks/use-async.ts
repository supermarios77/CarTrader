import { useState, useCallback } from 'react';
import { useErrorHandler } from './use-error-handler';

interface UseAsyncOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: unknown) => void;
  showToast?: boolean;
  logError?: boolean;
  customErrorMessage?: string;
}

/**
 * Hook for handling async operations with loading and error states
 */
export function useAsync<T>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { handleError } = useErrorHandler();

  const execute = useCallback(
    async (
      asyncFn: () => Promise<T>,
      options?: UseAsyncOptions<T>
    ): Promise<T | null> => {
      const {
        onSuccess,
        onError,
        showToast = true,
        logError = true,
        customErrorMessage,
      } = options || {};

      setLoading(true);
      setError(null);

      try {
        const result = await asyncFn();
        
        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (err) {
        const errorDetails = handleError(err, {
          showToast,
          logError,
          customMessage: customErrorMessage,
        });

        setError(errorDetails.userMessage);

        if (onError) {
          onError(err);
        }

        return null;
      } finally {
        setLoading(false);
      }
    },
    [handleError]
  );

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return {
    execute,
    loading,
    error,
    reset,
  };
}

