'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ContentSection } from '@/components/ContentSection';

type BucketListItem = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  timelineEntryId?: string;
  category: string;
};

const bucketListData: Record<string, BucketListItem[]> = {
  'Travel & Adventure': [
    { id: '1', title: 'Visit all 7 continents', completed: false, category: 'Travel & Adventure' },
    { id: '2', title: 'Hike to Machu Picchu', completed: false, category: 'Travel & Adventure' },
    { id: '3', title: 'Go scuba diving in the Great Barrier Reef', completed: false, category: 'Travel & Adventure' },
    { id: '4', title: 'See the Northern Lights', completed: false, category: 'Travel & Adventure' },
    { id: '5', title: 'Road trip across Route 66', completed: false, category: 'Travel & Adventure' },
  ],
  'Personal Growth': [
    { id: '6', title: 'Learn a new language fluently', completed: false, category: 'Personal Growth' },
    { id: '7', title: 'Run a marathon', completed: false, category: 'Personal Growth' },
    { id: '8', title: 'Write and publish a book', completed: false, category: 'Personal Growth' },
    { id: '9', title: 'Master a musical instrument', completed: false, category: 'Personal Growth' },
    { id: '10', title: 'Complete a 30-day meditation challenge', completed: false, category: 'Personal Growth' },
  ],
  'Creative Projects': [
    { id: '11', title: 'Build a personal portfolio website', completed: true, category: 'Creative Projects', timelineEntryId: 'placeholder-jan-1' },
    { id: '12', title: 'Create a short film', completed: false, category: 'Creative Projects' },
    { id: '13', title: 'Learn photography and hold an exhibition', completed: false, category: 'Creative Projects' },
    { id: '14', title: 'Design and launch a mobile app', completed: false, category: 'Creative Projects' },
    { id: '15', title: 'Start a YouTube channel', completed: false, category: 'Creative Projects' },
  ],
  'Food & Culinary': [
    { id: '16', title: 'Take a cooking class in Italy', completed: false, category: 'Food & Culinary' },
    { id: '17', title: 'Master making sushi', completed: false, category: 'Food & Culinary' },
    { id: '18', title: 'Try food from 50 different countries', completed: false, category: 'Food & Culinary' },
    { id: '19', title: 'Brew my own beer', completed: false, category: 'Food & Culinary' },
    { id: '20', title: 'Host a dinner party for 20+ people', completed: false, category: 'Food & Culinary' },
  ],
  'Experiences & Skills': [
    { id: '21', title: 'Learn to surf', completed: false, category: 'Experiences & Skills' },
    { id: '22', title: 'Go skydiving', completed: false, category: 'Experiences & Skills' },
    { id: '23', title: 'Attend a major music festival', completed: false, category: 'Experiences & Skills' },
    { id: '24', title: 'Volunteer abroad for a month', completed: false, category: 'Experiences & Skills' },
    { id: '25', title: 'Get certified in scuba diving', completed: false, category: 'Experiences & Skills' },
  ],
};

export default function BucketListPage() {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(
    Object.keys(bucketListData).reduce((acc, key) => ({ ...acc, [key]: true }), {})
  );

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const totalItems = Object.values(bucketListData).flat().length;
  const completedItems = Object.values(bucketListData).flat().filter((item) => item.completed).length;
  const progressPercentage = Math.round((completedItems / totalItems) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/70 via-purple-50/60 to-transparent dark:from-indigo-950/60 dark:via-indigo-900/40" />
        <ContentSection padding="py-16 md:py-20" className="text-center relative">
          <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-semibold shadow-sm dark:bg-indigo-900/40 dark:text-indigo-100">
            🎯 Adventures • Goals • Dreams
          </p>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight text-gray-900 dark:text-white mt-6">
            My Bucket List
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mt-4 max-w-3xl mx-auto">
            A collection of experiences, goals, and side quests I&apos;m working toward. Each completed item links back to the timeline entry where I documented the adventure.
          </p>

          {/* Progress Bar */}
          <div className="max-w-2xl mx-auto mt-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Overall Progress
              </span>
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                {completedItems} / {totalItems} completed ({progressPercentage}%)
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </ContentSection>
      </section>

      {/* Bucket List Categories */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="space-y-8">
          {Object.entries(bucketListData).map(([category, categoryItems]) => {
            const categoryCompleted = categoryItems.filter((item) => item.completed).length;
            const categoryTotal = categoryItems.length;
            const isExpanded = expandedCategories[category];

            return (
              <div key={category} className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{category}</h2>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {categoryCompleted} / {categoryTotal}
                    </span>
                  </div>
                  <svg
                    className={`w-6 h-6 text-gray-600 dark:text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Category Items */}
                {isExpanded && (
                  <div className="px-6 pb-6 space-y-3">
                    {categoryItems.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-start gap-4 p-4 rounded-xl border transition ${
                          item.completed
                            ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                            : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              item.completed
                                ? 'bg-green-500 border-green-600'
                                : 'bg-white border-gray-300 dark:bg-gray-700 dark:border-gray-600'
                            }`}
                          >
                            {item.completed && (
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3
                            className={`font-semibold ${
                              item.completed
                                ? 'text-gray-700 dark:text-gray-300 line-through'
                                : 'text-gray-900 dark:text-white'
                            }`}
                          >
                            {item.title}
                          </h3>
                          {item.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
                          )}
                          {item.completed && item.timelineEntryId && (
                            <Link
                              href={`/#${item.timelineEntryId}`}
                              className="inline-flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:underline mt-2"
                            >
                              <span>View timeline entry</span>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                                />
                              </svg>
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <Footer />
    </div>
  );
}
