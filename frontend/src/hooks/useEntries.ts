'use client';

import useSWR from 'swr';
import { api } from '@/lib/api';

type UseEntriesOptions = {
  page?: number;
  limit?: number;
  status?: string;
  revalidateOnFocus?: boolean;
};

export function useEntries(options: UseEntriesOptions = {}) {
  const { page = 1, limit = 10, status = 'published', revalidateOnFocus = false } = options;

  const { data, error, isLoading, mutate } = useSWR(
    `/entries?page=${page}&limit=${limit}&status=${status}`,
    () => api.entries.getAll(page, limit),
    {
      revalidateOnFocus,
      revalidateOnReconnect: true,
      dedupingInterval: 5 * 60 * 1000, // 5 minutes
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }
  );

  return {
    entries: data?.entries || [],
    total: data?.total || 0,
    pages: data?.pages || 0,
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useTimeline() {
  const { data, error, isLoading, mutate } = useSWR(
    '/timeline',
    () => api.entries.getTimeline(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5 * 60 * 1000, // 5 minutes
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }
  );

  return {
    timeline: data || [],
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useEntry(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/entries/${id}` : null,
    () => (id ? api.entries.getOne(id) : null),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 2 * 60 * 1000, // 2 minutes
      errorRetryCount: 3,
    }
  );

  return {
    entry: data || null,
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useEntriesByMonth(year: number, month: number) {
  const { data, error, isLoading, mutate } = useSWR(
    year && month ? `/entries/month/${year}/${month}` : null,
    () => (year && month ? api.entries.getByMonth(year, month) : null),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 10 * 60 * 1000, // 10 minutes
    }
  );

  return {
    entries: data || [],
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useSearchEntries(query: string) {
  const { data, error, isLoading, mutate } = useSWR(
    query ? `/entries/search/${query}` : null,
    () => (query ? api.entries.search(query) : null),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30 * 1000, // 30 seconds
      errorRetryCount: 2,
    }
  );

  return {
    results: data || [],
    isLoading,
    error,
    refresh: mutate,
  };
}
