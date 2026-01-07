'use client';

import React from 'react';

export type StatusBadgeType = 'published' | 'draft' | 'archived' | 'pending' | 'flagged' | 'approved' | 'rejected';

interface StatusBadgeProps {
  status: StatusBadgeType;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const statusConfig: Record<StatusBadgeType, { bg: string; text: string; label: string }> = {
    published: { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-800 dark:text-green-200', label: 'Published' },
    draft: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', label: 'Draft' },
    archived: { bg: 'bg-slate-100 dark:bg-slate-900/40', text: 'text-slate-700 dark:text-slate-300', label: 'Archived' },
    pending: { bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-800 dark:text-amber-200', label: 'Pending' },
    flagged: { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-800 dark:text-red-200', label: 'Flagged' },
    approved: { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-800 dark:text-green-200', label: 'Approved' },
    rejected: { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-800 dark:text-red-200', label: 'Rejected' },
  };

  const config = statusConfig[status];

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text} ${className}`}>
      {config.label}
    </span>
  );
}
