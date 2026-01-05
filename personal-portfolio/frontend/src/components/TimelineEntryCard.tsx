'use client';

import { Entry } from '@/types';

type TimelineEntryCardProps = {
  entry: Entry;
};

export function TimelineEntryCard({ entry }: TimelineEntryCardProps) {
  const date = new Date(entry.entryDate);
  const day = date.toLocaleDateString('en-US', { day: '2-digit' });
  const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <article className="pb-8">
      <div className="flex gap-6">
        {/* Date Badge */}
        <div className="flex-shrink-0 w-20 text-center">
          <div className="font-bold text-2xl text-indigo-600 dark:text-indigo-400">{day}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{dateLabel.split(' ')[0]}</div>
        </div>

        {/* Content */}
        <div className="flex-grow">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{entry.title}</h3>
          {entry.summary && (
            <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">{entry.summary}</p>
          )}

          {/* Meta Information */}
          <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
            {entry.views !== undefined && <span>👁️ {entry.views} views</span>}
            {entry.media && entry.media.length > 0 && (
              <span>🖼️ {entry.media.length} {entry.media.length === 1 ? 'photo' : 'photos'}</span>
            )}
            {entry.embeds && entry.embeds.length > 0 && (
              <span>🔗 {entry.embeds.length} {entry.embeds.length === 1 ? 'embed' : 'embeds'}</span>
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
