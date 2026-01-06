'use client';

import React from 'react';
import { Card } from '@/components/Card';
import { SkeletonLine, SkeletonButton, SkeletonLoader } from '@/components/SkeletonLoader';

export function ModerationSkeleton() {
  return (
    <Card variant="warning">
      <div className="space-y-4">
        {/* Header with author and entry link */}
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <SkeletonLine className="w-40 h-5" />
              <SkeletonLine className="w-32 h-5" />
            </div>
            <SkeletonLine className="w-48 h-4" />
          </div>
          <SkeletonLoader width="w-20" height="h-6" className="rounded-full" />
        </div>

        {/* Comment text */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
          <SkeletonLine />
          <SkeletonLine />
          <SkeletonLine className="w-4/5" />
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <SkeletonButton />
          <SkeletonButton />
          <SkeletonButton />
        </div>
      </div>
    </Card>
  );
}

export function ModerationListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <ModerationSkeleton key={i} />
      ))}
    </div>
  );
}
