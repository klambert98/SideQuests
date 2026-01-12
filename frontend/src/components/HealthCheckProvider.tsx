'use client';

import { useEffect } from 'react';
import { startHealthChecks, stopHealthChecks } from '@/lib/healthCheck';

export function HealthCheckProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Start health checks on mount
    startHealthChecks();

    // Cleanup on unmount
    return () => {
      stopHealthChecks();
    };
  }, []);

  return <>{children}</>;
}
