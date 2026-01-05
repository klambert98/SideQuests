'use client';

import useSWR from 'swr';
import { api } from '@/lib/api';

export function useMedia(entryId?: string) {
  const { data, error, isLoading, mutate} = useSWR(
    entryId ? `/media/${entryId}` : null,
    () => (entryId ? api.media.getByEntry(entryId) : null),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5 * 60 * 1000, // 5 minutes
    }
  );

  return {
    media: data || [],
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useEmbeds(_entryId?: string) {
  // Note: Embeds are loaded with entry data currently
  // No separate embeds API endpoint exists yet
  return {
    embeds: [],
    isLoading: false,
    error: null,
    refresh: () => {},
  };
}

export function useApiHealth() {
  const { data, error, isLoading } = useSWR(
    '/health',
    () => api.health(),
    {
      refreshInterval: 30000, // Check every 30 seconds
      revalidateOnFocus: false,
      errorRetryCount: 1,
    }
  );

  return {
    isOnline: data?.status === 'online' || data?.status === 'OK',
    status: data?.status || 'offline',
    isLoading,
    error,
  };
}
