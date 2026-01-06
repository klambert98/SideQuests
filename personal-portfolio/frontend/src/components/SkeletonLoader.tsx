'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export function SkeletonLoader({ className = '', width = 'w-full', height = 'h-4' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${width} ${height} ${className}`}
      aria-label="Loading..."
    />
  );
}

export function SkeletonLine({ className = '' }: { className?: string }) {
  return <SkeletonLoader className={className} width="w-full" height="h-4" />;
}

export function SkeletonCircle({ size = 'w-10 h-10', className = '' }: { size?: string; className?: string }) {
  return <SkeletonLoader className={`rounded-full ${className}`} width={size} height={size} />;
}

export function SkeletonButton({ className = '' }: { className?: string }) {
  return <SkeletonLoader className={className} width="w-24" height="h-10" />;
}
