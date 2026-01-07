'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PageLayout } from '@/components/PageLayout';
import type { Entry } from '@/types';
import Link from 'next/link';

type Comment = {
  id: string;
  text: string;
  name?: string;
  userId?: string | null;
  createdAt: string;
  moderationStatus?: 'pending' | 'approved' | 'rejected' | 'flagged';
  entry?: { id: string; title: string };
};

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
  const [recentComments, setRecentComments] = useState<Comment[]>([]);
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

        // Fetch recent comments
        try {
          const commentsData = await api.moderation.getPendingComments(token!);
          setRecentComments(commentsData.slice(0, 5));
        } catch (error) {
          console.error('Failed to fetch comments:', error);
        }
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

          <Link href="/dashboard/entries?status=published">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
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
          </Link>

          <Link href="/dashboard/entries?status=draft">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
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
          </Link>
        </div>

        {/* Top Posts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            🏆 Top Viewed Posts
          </h2>
          {metrics?.topPosts && metrics.topPosts.length > 0 ? (
            <div className="space-y-3">
              {metrics.topPosts.map((post, index) => (
                <Link href={`/entries/${post.id}`} key={post.id}>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition cursor-pointer">
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
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              No published posts yet. Create your first post to see metrics!
            </p>
          )}
        </div>

        {/* Recent Comments */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            💬 Recent Comments
          </h2>
          {recentComments.length > 0 ? (
            <div className="space-y-3">
              {recentComments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {comment.name || (comment.userId ? 'User' : 'Anonymous')}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {comment.moderationStatus && (
                      <span className={`px-2 py-1 text-xs rounded ${
                        comment.moderationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        comment.moderationStatus === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {comment.moderationStatus}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    {comment.text}
                  </p>
                  {comment.entry && (
                    <Link href={`/entries/${comment.entry.id}`}>
                      <p className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mt-2">
                        On: {comment.entry.title}
                      </p>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              No recent comments yet.
            </p>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
