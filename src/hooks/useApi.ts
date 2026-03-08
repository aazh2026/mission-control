'use client';

import { useState, useEffect, useCallback } from 'react';

// 通用数据获取 Hook
export function useApiQuery<T>(
  url: string,
  deps: any[] = []
): { data: T | null; error: Error | null; isLoading: boolean; refetch: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [url, ...deps]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, isLoading, refetch: fetchData };
}

// 通用 mutation Hook
export function useApiMutation<T, Args extends any[]>(
  url: string,
  method: string = 'POST'
): {
  mutate: (...args: Args) => Promise<T>;
  isLoading: boolean;
  error: Error | null;
} {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (...args: Args): Promise<T> => {
    setIsLoading(true);
    setError(null);
    try {
      const body = args.length > 0 ? JSON.stringify(args[0]) : undefined;
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [url, method]);

  return { mutate, isLoading, error };
}
