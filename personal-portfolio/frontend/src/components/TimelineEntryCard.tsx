'use client';

import Link from 'next/link';
import { Entry } from '@/types';
import { getMediaUrl } from '@/lib/api';
import { OptimizedImage } from './OptimizedImage';

type TimelineEntryCardProps = {
  entry: Entry;
};

export function TimelineEntryCard({ entry }: TimelineEntryCardProps) {
  const date = new Date(entry.entryDate);
  const day = date.toLocaleDateString('en-US', { day: '2-digit' });
  const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  // Get the first media item (prefer images/videos)
  const firstMedia = entry.media && entry.media.length > 0 ? entry.media[0] : null;

  return (
    <article className="pb-8">
      <div className="flex gap-6">
        {/* Date Badge */}
        <div className="flex-shrink-0 w-20 text-center">
          <div className="font-bold text-2xl text-indigo-600 dark:text-indigo-400">{day}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{dateLabel.split(' ')[0]}</div>
        </div>

        {/* Content Card */}
        <div className="flex-grow bg-white/90 dark:bg-gray-900/80 backdrop-blur rounded-2xl shadow-lg border border-indigo-100/70 dark:border-indigo-900 p-6">
          <Link href={`/entries/${entry.id}`}>
            <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 cursor-pointer transition mb-2">
              {entry.title}
            </h3>
          </Link>
          {entry.summary && (
            <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">{entry.summary}</p>
          )}

          {/* First Media */}
          {firstMedia && (
            <div className="mb-4 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              <Link href={`/entries/${entry.id}`}>
                <OptimizedImage
                  src={getMediaUrl(firstMedia.url)}
                  alt={firstMedia.fileName || 'Media'}
                  width={400}
                  height={250}
                  className="w-full h-auto cursor-pointer hover:opacity-90 transition"
                />
              </Link>
            </div>
          )}

          {/* Meta Information */}
          <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
            {entry.views !== undefined && <span>👁️ {entry.views} views</span>}
            {entry.likes !== undefined && <span>❤️ {entry.likes} likes</span>}
            {entry.comments_count !== undefined && (
              <span>💬 {entry.comments_count} {entry.comments_count === 1 ? 'comment' : 'comments'}</span>
            )}
          </div>

          {/* Tags */}
          {entry.tags && entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {entry.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs rounded-full"
                >
                  #{tag}
                </span>
              ))}
              {entry.tags.length > 3 && (
                <span className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400">
                  +{entry.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
