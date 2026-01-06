'use client';

import React from 'react';
import { Card } from '@/components/Card';
import { SkeletonLine, SkeletonLoader } from '@/components/SkeletonLoader';

export function EntrySkeleton() {
  return (
    <Card>
      <div className="space-y-4">
        {/* Title */}
        <SkeletonLine className="h-8 w-3/4" />
        
        {/* Date and status */}
        <div className="flex gap-3 items-center">
          <SkeletonLine className="w-32 h-4" />
          <SkeletonLoader width="w-20" height="h-6" className="rounded-full" />
        </div>

        {/* Summary */}
        <div className="space-y-2">
          <SkeletonLine />
          <SkeletonLine />
          <SkeletonLine className="w-5/6" />
        </div>

        {/* Tags */}
        <div className="flex gap-2">
          <SkeletonLoader width="w-16" height="h-6" className="rounded-full" />
          <SkeletonLoader width="w-20" height="h-6" className="rounded-full" />
          <SkeletonLoader width="w-24" height="h-6" className="rounded-full" />
        </div>
      </div>
    </Card>
  );
}

export function EntryListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <EntrySkeleton key={i} />
      ))}
    </div>
  );
}
