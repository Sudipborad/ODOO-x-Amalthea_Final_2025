import { useState, useEffect } from 'react';
import { cacheManager } from '../utils/cacheManager';

interface UseFetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const useFetch = <T>(
  fetchFunction: () => Promise<T>,
  dependencies: any[] = []
): UseFetchState<T> & { refetch: () => void } => {
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = async () => {
    console.log('useFetch: Starting data fetch');
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await fetchFunction();
      console.log('useFetch: Data fetched successfully');
      setState({ data: result, loading: false, error: null });
    } catch (error) {
      console.error('useFetch: Fetch error:', error);
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  useEffect(() => {
    console.log('useFetch: Subscribing to cache manager');
    const unsubscribe = cacheManager.subscribe(() => {
      console.log('useFetch: Cache invalidation received, refetching data');
      fetchData();
    });
    return unsubscribe;
  }, []);

  return {
    ...state,
    refetch: fetchData,
  };
};