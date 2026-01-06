'use client';

import React from 'react';
import { Card } from '@/components/Card';
import { SkeletonLine, SkeletonCircle, SkeletonButton } from '@/components/SkeletonLoader';

export function CommentSkeleton() {
  return (
    <Card>
      <div className="flex items-start gap-3 mb-4">
        <SkeletonCircle size="w-10 h-10" />
        <div className="flex-1 space-y-2">
          <SkeletonLine className="w-32" />
          <SkeletonLine className="w-48" />
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <SkeletonLine />
        <SkeletonLine />
        <SkeletonLine className="w-3/4" />
      </div>

      <div className="flex gap-2">
        <SkeletonButton />
      </div>
    </Card>
  );
}

export function CommentListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <CommentSkeleton key={i} />
      ))}
    </div>
  );
}
