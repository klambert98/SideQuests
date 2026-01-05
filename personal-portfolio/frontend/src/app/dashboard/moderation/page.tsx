'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/Button';

type Comment = {
  id: string;
  text: string;
  moderationStatus: 'pending' | 'approved' | 'rejected' | 'flagged';
  moderationReason?: string;
  createdAt: string;
  user: {
    name?: string;
    email: string;
  };
  entry: {
    id: string;
    title: string;
  };
};

export default function ModerationPage() {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const [pendingComments, setPendingComments] = useState<Comment[]>([]);
  const [flaggedComments, setFlaggedComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'flagged'>('pending');
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    setAuthChecked(true);
  }, []);

  useEffect(() => {
    if (authChecked && !isAuthenticated) {
      router.push('/login');
    }
  }, [authChecked, isAuthenticated, router]);

  const fetchComments = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

      const [pendingRes, flaggedRes] = await Promise.all([
        fetch(`${baseUrl}/entries/moderation/pending`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${baseUrl}/entries/moderation/flagged`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (pendingRes.ok) {
        const pending = await pendingRes.json();
        setPendingComments(pending);
      }

      if (flaggedRes.ok) {
        const flagged = await flaggedRes.json();
        setFlaggedComments(flagged);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleModerate = async (
    commentId: string,
    entryId: string,
    status: 'approved' | 'rejected',
    reason?: string
  ) => {
    if (!token) return;

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(
        `${baseUrl}/entries/${entryId}/comments/${commentId}/moderate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status, reason }),
        }
      );

      if (response.ok) {
        // Refresh the lists
        await fetchComments();
      } else {
        const error = await response.json();
        alert(`Failed to moderate comment: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to moderate comment:', error);
      alert('Failed to moderate comment');
    }
  };

  if (!authChecked || !token) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">Loading...</div>
        </main>
      </div>
    );
  }

  const commentsToShow = activeTab === 'pending' ? pendingComments : flaggedComments;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Comment Moderation
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Review and moderate comments before they appear publicly
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-800 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('pending')}
              className={`${
                activeTab === 'pending'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Pending ({pendingComments.length})
            </button>
            <button
              onClick={() => setActiveTab('flagged')}
              className={`${
                activeTab === 'flagged'
                  ? 'border-yellow-500 text-yellow-600 dark:text-yellow-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Flagged ({flaggedComments.length})
            </button>
          </nav>
        </div>

        {/* Comments List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading comments...</p>
          </div>
        ) : commentsToShow.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">
              {activeTab === 'pending'
                ? 'No pending comments to review'
                : 'No flagged comments to review'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {commentsToShow.map((comment) => (
              <div
                key={comment.id}
                className={`bg-white dark:bg-gray-900 rounded-lg shadow-sm border ${
                  activeTab === 'flagged'
                    ? 'border-yellow-300 dark:border-yellow-700'
                    : 'border-gray-200 dark:border-gray-800'
                } p-6`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {comment.user.name || comment.user.email}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-500">
                        on
                      </span>
                      <a
                        href={`/entries/${comment.entry.id}`}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {comment.entry.title}
                      </a>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {activeTab === 'flagged' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      Flagged
                    </span>
                  )}
                </div>

                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                    {comment.text}
                  </p>
                </div>

                {comment.moderationReason && (
                  <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                      Flag Reason:
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      {comment.moderationReason}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleModerate(comment.id, comment.entry.id, 'approved')}
                    variant="primary"
                  >
                    ✓ Approve
                  </Button>
                  <Button
                    onClick={() => {
                      const reason = prompt('Rejection reason (optional):');
                      handleModerate(
                        comment.id,
                        comment.entry.id,
                        'rejected',
                        reason || 'Rejected by moderator'
                      );
                    }}
                    variant="secondary"
                  >
                    ✗ Reject
                  </Button>
                  <a
                    href={`/entries/${comment.entry.id}`}
                    className="ml-auto text-sm text-blue-600 dark:text-blue-400 hover:underline self-center"
                  >
                    View Entry →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
