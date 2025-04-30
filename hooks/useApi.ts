import { useState, useCallback } from 'react';
import { ApiError } from '../lib/api';

type ApiFunction<T, A extends any[]> = (...args: A) => Promise<T>;

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
  loadingInitial?: boolean;
}

/**
 * Hook for managing API calls with loading and error states
 * 
 * @param apiFunction - The API function to call
 * @param options - Optional configuration
 * @returns An object with loading state, error state, data, and execute function
 */
export function UseApi<T, A extends any[]>(
  apiFunction: ApiFunction<T, A>,
  options: UseApiOptions = {}
) {
  const { onSuccess, onError, loadingInitial = false } = options;
  
  const [isLoading, setIsLoading] = useState<boolean>(loadingInitial);
  const [error, setError] = useState<ApiError | null>(null);
  const [data, setData] = useState<T | null>(null);
  
  const Execute = useCallback(async (...args: A): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction(...args);
      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const apiError = err instanceof ApiError
        ? err
        : new ApiError(500, err instanceof Error ? err.message : 'Unknown error');
      setError(apiError);
      onError?.(apiError);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [apiFunction, onSuccess, onError]);
  
  return {
    isLoading,
    error,
    data,
    Execute,
    Reset: useCallback(() => {
      setError(null);
      setData(null);
    }, []),
  };
}

export default UseApi; 