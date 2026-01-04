'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Timeline {
  [year: string]: {
    [month: string]: any[];
  };
}

export default function TimelinePage() {
  const [timeline, setTimeline] = useState<Timeline>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const data = await api.entries.getTimeline();
        setTimeline(data);
      } catch (error) {
        console.error('Failed to fetch timeline:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeline();
  }, []);

  const sortedYears = Object.keys(timeline).sort((a, b) => parseInt(b) - parseInt(a));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Timeline
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Browse my memories organized by month
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="text-center py-12">Loading timeline...</div>
        ) : Object.keys(timeline).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No entries yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {sortedYears.map((year) => (
              <div key={year}>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 sticky top-0 bg-gray-50 dark:bg-gray-950 py-4">
                  {year}
                </h2>

                <div className="space-y-8">
                  {Object.entries(timeline[year])
                    .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
                    .map(([month, entries]) => (
                      <div key={`${year}-${month}`}>
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                          <span className="inline-block w-4 h-4 rounded-full bg-indigo-600 mr-3"></span>
                          {new Date(`${year}-${month}-01`).toLocaleDateString('en-US', {
                            month: 'long',
                          })}
                        </h3>

                        <div className="space-y-4 pl-8 border-l-2 border-indigo-200 dark:border-indigo-800">
                          {entries.map((entry: any) => (
                            <div
                              key={entry.id}
                              className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm hover:shadow-md transition border border-gray-200 dark:border-gray-800"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-indigo-600 cursor-pointer">
                                  {entry.title}
                                </h4>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(entry.entryDate).toLocaleDateString()}
                                </span>
                              </div>

                              {entry.summary && (
                                <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                  {entry.summary}
                                </p>
                              )}

                              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex gap-4">
                                  {entry.media?.length > 0 && (
                                    <span>📸 {entry.media.length} media</span>
                                  )}
                                  {entry.embeds?.length > 0 && (
                                    <span>🔗 {entry.embeds.length} embeds</span>
                                  )}
                                  {entry.tags?.length > 0 && (
                                    <span>🏷️ {entry.tags.length} tags</span>
                                  )}
                                </div>
                                <span>{entry.views} views</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
