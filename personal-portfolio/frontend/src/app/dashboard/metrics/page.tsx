'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PageLayout } from '@/components/PageLayout';
import type { Entry } from '@/types';

interface MetricsData {
  totalViews: number;
  totalEntries: number;
  publishedEntries: number;
  draftEntries: number;
  topPosts: Entry[];
}

export default function MetricsPage() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Give time for auth to initialize from localStorage
    const timer = setTimeout(() => {
      setAuthChecked(true);
      if (!isAuthenticated) {
        router.push('/login');
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!authChecked || !isAuthenticated) {
      return;
    }

    const fetchMetrics = async () => {
      try {
        // Fetch all entries to calculate metrics
        const result = await api.entries.getAll(1, 100);
        const entries = result.data || [];

        const totalViews = entries.reduce((sum: number, entry: any) => sum + (entry.views || 0), 0);
        const publishedEntries = entries.filter((e: any) => e.status === 'published').length;
        const draftEntries = entries.filter((e: any) => e.status === 'draft').length;
        const topPosts = entries
          .filter((e: any) => e.status === 'published')
          .sort((a: any, b: any) => (b.views || 0) - (a.views || 0))
          .slice(0, 5);

        setMetrics({
          totalViews,
          totalEntries: entries.length,
          publishedEntries,
          draftEntries,
          topPosts,
        });
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [authChecked, isAuthenticated, token]);

  if (!authChecked || !isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading metrics...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            📊 Portfolio Metrics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Overview of your portfolio statistics and performance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Views</p>
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                  {metrics?.totalViews.toLocaleString() || 0}
                </p>
              </div>
              <div className="text-4xl">👀</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Posts</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {metrics?.totalEntries || 0}
                </p>
              </div>
              <div className="text-4xl">📝</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Published</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {metrics?.publishedEntries || 0}
                </p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Drafts</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {metrics?.draftEntries || 0}
                </p>
              </div>
              <div className="text-4xl">📄</div>
            </div>
          </div>
        </div>

        {/* Top Posts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            🏆 Top Viewed Posts
          </h2>
          {metrics?.topPosts && metrics.topPosts.length > 0 ? (
            <div className="space-y-3">
              {metrics.topPosts.map((post, index) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-2xl font-bold text-gray-400 dark:text-gray-500 w-8">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(post.entryDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">👁️</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {post.views || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              No published posts yet. Create your first post to see metrics!
            </p>
          )}
        </div>

        {/* Comments Section Placeholder */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            💬 Recent Comments
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center py-8">
            Comment system coming soon! This will show recent visitor comments on your posts.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
