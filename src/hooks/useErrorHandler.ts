import { useState, useCallback } from 'react';

interface ErrorState {
  error: Error | null;
  isError: boolean;
  errorMessage: string;
}

interface UseErrorHandlerReturn {
  error: Error | null;
  isError: boolean;
  errorMessage: string;
  setError: (error: Error | string | null) => void;
  clearError: () => void;
  handleAsyncError: <T>(promise: Promise<T>) => Promise<T | null>;
}

export function useErrorHandler(): UseErrorHandlerReturn {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isError: false,
    errorMessage: '',
  });

  const setError = useCallback((error: Error | string | null) => {
    if (!error) {
      setErrorState({
        error: null,
        isError: false,
        errorMessage: '',
      });
      return;
    }

    const errorObj = error instanceof Error ? error : new Error(String(error));
    const message = errorObj.message || 'An unexpected error occurred';

    setErrorState({
      error: errorObj,
      isError: true,
      errorMessage: message,
    });

    // Log error for debugging
    console.error('Error handled:', errorObj);
  }, []);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isError: false,
      errorMessage: '',
    });
  }, []);

  const handleAsyncError = useCallback(async <T>(promise: Promise<T>): Promise<T | null> => {
    try {
      const result = await promise;
      clearError(); // Clear any previous errors on success
      return result;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      setError(errorObj);
      return null;
    }
  }, [setError, clearError]);

  return {
    error: errorState.error,
    isError: errorState.isError,
    errorMessage: errorState.errorMessage,
    setError,
    clearError,
    handleAsyncError,
  };
}