'use client';

import React from 'react';
import { Card } from '@/components/Card';
import { StatusBadge } from '@/components/StatusBadge';

interface CommentAuthor {
  name?: string | null;
  email?: string;
}

interface CommentEntry {
  id: string;
  title: string;
}

interface CommentCardProps {
  id: string;
  text: string;
  name?: string | null;
  author?: CommentAuthor | null;
  createdAt: string;
  entry: CommentEntry;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  moderationReason?: string | null;
  isPending?: boolean;
  showPendingNotice?: boolean;
  children?: React.ReactNode; // For action buttons
}

export function CommentCard({
  text,
  name,
  author,
  createdAt,
  entry,
  status,
  moderationReason,
  isPending,
  showPendingNotice,
  children,
}: Omit<CommentCardProps, 'id'>) {
  const displayName = author
    ? author.name || author.email
    : name || 'Anonymous';

  return (
    <div>
      {showPendingNotice && (
        <div className="mb-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⏳ Your comment is awaiting moderation and will be visible to others once approved by an admin.
          </p>
        </div>
      )}

      <Card
        variant={isPending ? 'warning' : 'default'}
        className={isPending ? 'opacity-80' : ''}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-gray-900 dark:text-white">
                {displayName}
              </span>
              {(status === 'pending' || status === 'flagged') && (
                <StatusBadge status={status as 'pending' | 'flagged'} />
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {new Date(createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        {/* Comment text */}
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words">
            {text}
          </p>
        </div>

        {/* Entry link */}
        <div className="mb-4 text-sm">
          <span className="text-gray-600 dark:text-gray-400">On entry: </span>
          <a
            href={`/entries/${entry.id}`}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            {entry.title}
          </a>
        </div>

        {/* Moderation reason (if rejected or flagged) */}
        {moderationReason && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
              {status === 'rejected' ? 'Rejection Reason:' : 'Flag Reason:'}
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              {moderationReason}
            </p>
          </div>
        )}

        {/* Action buttons (passed as children) */}
        {children && <div className="flex gap-3 flex-wrap">{children}</div>}
      </Card>
    </div>
  );
}
