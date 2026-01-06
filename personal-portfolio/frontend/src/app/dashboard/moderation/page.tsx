'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/Button';
import { CommentCard } from '@/components/CommentCard';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ModerationListSkeleton } from '@/components/ModerationSkeleton';

type Comment = {
  id: string;
  text: string;
  name?: string | null;
  moderationStatus: 'pending' | 'approved' | 'rejected' | 'flagged';
  moderationReason?: string;
  createdAt: string;
  user: {
    name?: string;
    email: string;
  } | null;
  entry: {
    id: string;
    title: string;
  };
};

export default function ModerationPage() {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [pendingComments, setPendingComments] = useState<Comment[]>([]);
  const [flaggedComments, setFlaggedComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'flagged'>('pending');
  const [authChecked, setAuthChecked] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [pendingRejectComment, setPendingRejectComment] = useState<{ id: string; entryId: string } | null>(null);
  const [isModeratingLoading, setIsModeratingLoading] = useState(false);

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
      toastError('Failed to load comments');
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
      setIsModeratingLoading(true);
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
        success(`Comment ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
        // Refresh the lists
        await fetchComments();
        setRejectDialogOpen(false);
        setRejectionReason('');
        setPendingRejectComment(null);
      } else {
        const errorData = await response.json();
        toastError(`Failed to moderate comment: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Failed to moderate comment:', error);
      toastError('Failed to moderate comment');
    } finally {
      setIsModeratingLoading(false);
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
          <ModerationListSkeleton count={5} />
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
              <CommentCard
                key={comment.id}
                text={comment.text}
                name={comment.name}
                author={comment.user}
                createdAt={comment.createdAt}
                entry={comment.entry}
                status={comment.moderationStatus}
                moderationReason={comment.moderationReason}
              >
                <Button
                  onClick={() => handleModerate(comment.id, comment.entry.id, 'approved')}
                  variant="primary"
                  disabled={isModeratingLoading}
                >
                  ✓ Approve
                </Button>
                <Button
                  onClick={() => {
                    setPendingRejectComment({ id: comment.id, entryId: comment.entry.id });
                    setRejectDialogOpen(true);
                  }}
                  variant="secondary"
                  disabled={isModeratingLoading}
                >
                  ✗ Reject
                </Button>
                <a
                  href={`/entries/${comment.entry.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  View Entry ↗
                </a>
              </CommentCard>
            ))}
          </div>
        )}

        {/* Rejection Reason Dialog */}
        <ConfirmDialog
          isOpen={rejectDialogOpen}
          title="Reject Comment"
          message="Provide a reason for rejecting this comment (optional):"
          confirmText="Reject"
          cancelText="Cancel"
          isDangerous={true}
          isLoading={isModeratingLoading}
          onConfirm={() => {
            if (pendingRejectComment) {
              handleModerate(
                pendingRejectComment.id,
                pendingRejectComment.entryId,
                'rejected',
                rejectionReason || 'Rejected by moderator'
              );
            }
          }}
          onCancel={() => {
            setRejectDialogOpen(false);
            setRejectionReason('');
            setPendingRejectComment(null);
          }}
        >
          <input
            type="text"
            placeholder="Enter rejection reason..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </ConfirmDialog>
      </main>
      <Footer />
    </div>
  );
}
