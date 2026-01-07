'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api, getMediaUrl } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/contexts/ToastContext';
import type { Entry } from '@/types';
import { PageLayout } from '@/components/PageLayout';
import { Button } from '@/components/Button';
import { EmbedPreview } from '@/components/EmbedPreview';
import { CommentListSkeleton } from '@/components/CommentSkeleton';
import { SkeletonLine, SkeletonLoader } from '@/components/SkeletonLoader';
import Link from 'next/link';

type Comment = {
  id: string;
  text: string;
  name?: string;
  userId?: string | null;
  sessionToken?: string | null;
  createdAt: string;
  moderationStatus?: 'pending' | 'approved' | 'rejected' | 'flagged';
};

export default function EntryDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { token, user } = useAuth();
  const { error: toastError } = useToast();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newCommentName, setNewCommentName] = useState('');
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState<any[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [newEmbeds, setNewEmbeds] = useState<Array<{ url: string; title?: string; description?: string }>>([]);
  const [embedUrl, setEmbedUrl] = useState('');

  useEffect(() => {
    // Load session token from localStorage for anonymous users
    const storedSessionToken = localStorage.getItem('commentSessionToken');
    if (storedSessionToken) {
      setSessionToken(storedSessionToken);
    }

    const loadEntry = async () => {
      try {
        const data = await api.entries.getOne(id);
        setEntry(data);
        setLikes(data.likes || 0);
        
        // Load comments for this entry (pass token and sessionToken to see our pending comments)
        const storedToken = localStorage.getItem('token');
        const commentsData = await api.entries.getComments(id, storedToken || undefined, storedSessionToken || undefined);
        setComments(commentsData);
        
        // Check if current user has liked this entry
        if (user && data.userLikes && Array.isArray(data.userLikes)) {
          const hasLiked = data.userLikes.some((like: any) => like.userId === user.id);
          setIsLiked(hasLiked);
        }
      } catch (err: any) {
        toastError(err.message || 'Failed to load entry');
      } finally {
        setIsLoading(false);
      }
    };

    loadEntry();
  }, [id, user, toastError]);

  const handleLike = async () => {
    if (!token) return;

    try {
      if (isLiked) {
        await api.entries.unlike(token, id);
        setLikes(Math.max(0, likes - 1));
        setIsLiked(false);
      } else {
        await api.entries.like(token, id);
        setLikes(likes + 1);
        setIsLiked(true);
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to update like');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const comment = await api.entries.addComment(id, newComment, newCommentName, token || undefined, sessionToken || undefined);
      
      // If this is an anonymous comment, save the session token
      if (!token && comment.sessionToken) {
        localStorage.setItem('commentSessionToken', comment.sessionToken);
        setSessionToken(comment.sessionToken);
      }
      
      // Reload comments to get the proper status and ensure consistency
      const storedToken = localStorage.getItem('token');
      const updatedComments = await api.entries.getComments(id, storedToken || undefined, sessionToken || comment.sessionToken);
      setComments(updatedComments);
      setNewComment('');
      setNewCommentName('');
    } catch (err: any) {
      toastError(err.message || 'Failed to add comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await api.entries.deleteComment(id, commentId, token || undefined, sessionToken || undefined);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err: any) {
      toastError(err.message || 'Failed to delete comment');
    }
  };

  const handleDeleteEntry = async () => {
    if (!token) return;
    
    try {
      await api.entries.delete(token, id);
      window.location.href = '/';
    } catch (err: any) {
      toastError(err.message || 'Failed to delete entry');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !entry) return;

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      await api.entries.update(token, id, {
        title: formData.get('title') as string,
        content: formData.get('content') as string,
        summary: formData.get('summary') as string,
        entryDate: formData.get('entryDate') as string,
        tags: (formData.get('tags') as string).split(',').map(t => t.trim()).filter(Boolean),
      });

      // Upload new media
      if (uploadedMedia.length > 0) {
        for (const media of uploadedMedia) {
          await api.media.upload(token, media.file, id);
        }
      }

      // Create new embeds
      if (newEmbeds.length > 0) {
        for (const embed of newEmbeds) {
          await api.embeds.create(token, { url: embed.url, type: 'custom', entryId: id });
        }
      }

      // Reload entry to show new media/embeds
      const refreshedEntry = await api.entries.getOne(id);
      setEntry(refreshedEntry);
      setIsEditing(false);
      setUploadedMedia([]);
      setNewEmbeds([]);
    } catch (err: any) {
      toastError(err.message || 'Failed to update entry');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingFile(true);
    try {
      const newMedia = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        newMedia.push({
          file,
          preview: URL.createObjectURL(file),
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'document',
        });
      }
      setUploadedMedia([...uploadedMedia, ...newMedia]);
    } catch (err: any) {
      toastError(err.message || 'Failed to process files');
    } finally {
      setUploadingFile(false);
    }
  };

  const removeMedia = (index: number) => {
    setUploadedMedia(uploadedMedia.filter((_, i) => i !== index));
  };

  const handleAddEmbed = () => {
    if (!embedUrl.trim()) return;
    
    setNewEmbeds([...newEmbeds, { url: embedUrl.trim() }]);
    setEmbedUrl('');
  };

  const removeEmbed = (index: number) => {
    setNewEmbeds(newEmbeds.filter((_, i) => i !== index));
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!token) return;
    
    try {
      await api.media.delete(token, mediaId);
      const refreshedEntry = await api.entries.getOne(id);
      setEntry(refreshedEntry);
    } catch (err: any) {
      toastError(err.message || 'Failed to delete media');
    }
  };

  const handleDeleteEmbed = async (embedId: string) => {
    if (!token) return;
    
    try {
      await api.embeds.delete(token, embedId);
      const refreshedEntry = await api.entries.getOne(id);
      setEntry(refreshedEntry);
    } catch (err: any) {
      toastError(err.message || 'Failed to delete embed');
    }
  };

  if (isLoading) {
    return (
      <PageLayout showNavigation={false}>
        <div className="max-w-4xl mx-auto py-8">
          <div className="mb-8">
            <SkeletonLine className="w-32 h-6 mb-4" />
            <SkeletonLine className="h-12 w-3/4 mb-2" />
            <SkeletonLine className="w-48 h-6" />
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8">
            <div className="space-y-4">
              <SkeletonLine />
              <SkeletonLine />
              <SkeletonLine />
              <SkeletonLine className="w-5/6" />
            </div>
            
            <div className="mt-8 space-y-3">
              <SkeletonLoader width="w-full" height="h-64" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <SkeletonLine className="h-8 w-48 mb-6" />
            <CommentListSkeleton count={3} />
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!entry) {
    return (
      <PageLayout showNavigation={false}>
        <div className="max-w-4xl mx-auto py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Entry Not Found</h1>
            <Link href="/">
              <Button variant="primary">Back to Timeline</Button>
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  const entryDate = new Date(entry.entryDate);
  const formattedDate = entryDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <PageLayout showNavigation={false}>
      <article className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <Link href="/" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              ← Back to Timeline
            </Link>
            {user && (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Cancel Edit' : 'Edit'}
                </Button>
                <Button
                  variant="danger"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete
                </Button>
              </div>
            )}
          </div>

          {!isEditing ? (
            <>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{entry.title}</h1>
              <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400 mb-4">
                <span className="flex items-center gap-1">📅 {formattedDate}</span>
                <span className="flex items-center gap-1">👁️ {entry.views || 0} views</span>
              </div>

              {/* Tags */}
              {entry.tags && entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {entry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-sm rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  defaultValue={entry.title}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="entryDate"
                  defaultValue={typeof entry.entryDate === 'string' ? entry.entryDate.split('T')[0] : new Date(entry.entryDate).toISOString().split('T')[0]}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Summary
                </label>
                <textarea
                  name="summary"
                  defaultValue={entry.summary || ''}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Content
                </label>
                <textarea
                  name="content"
                  defaultValue={entry.content}
                  required
                  rows={10}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  defaultValue={entry.tags.join(', ')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Existing Media */}
              {entry.media && entry.media.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Media
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {entry.media.map((media) => (
                      <div key={media.id} className="relative group">
                        {media.type === 'image' ? (
                          <img src={getMediaUrl(media.url)} alt={media.originalName} className="w-full h-32 object-cover rounded" />
                        ) : media.type === 'video' ? (
                          <video src={getMediaUrl(media.url)} className="w-full h-32 object-cover rounded" />
                        ) : (
                          <div className="w-full h-32 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{media.originalName}</span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteMedia(media.id)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add New Media */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  📎 Add Media
                </label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept="image/*,video/*"
                  multiple
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-900 dark:file:text-indigo-200 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-800"
                  disabled={uploadingFile}
                />
                
                {uploadedMedia.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                    {uploadedMedia.map((media, index) => (
                      <div key={index} className="relative group">
                        {media.type === 'image' ? (
                          <img src={media.preview} alt={media.name} className="w-full h-32 object-cover rounded" />
                        ) : media.type === 'video' ? (
                          <video src={media.preview} className="w-full h-32 object-cover rounded" />
                        ) : (
                          <div className="w-full h-32 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{media.name}</span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeMedia(index)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Existing Embeds */}
              {entry.embeds && entry.embeds.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Link Previews
                  </label>
                  <div className="space-y-2">
                    {entry.embeds.map((embed) => (
                      <div key={embed.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded">
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{embed.url}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteEmbed(embed.id)}
                          className="ml-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add New Embeds */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  🔗 Add Link Preview
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={embedUrl}
                    onChange={(e) => setEmbedUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddEmbed}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    Add
                  </button>
                </div>
                
                {newEmbeds.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {newEmbeds.map((embed, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded">
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{embed.url}</span>
                        <button
                          type="button"
                          onClick={() => removeEmbed(index)}
                          className="ml-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="submit" variant="primary">
                  Save Changes
                </Button>
                <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>

        {!isEditing && (
          <>
            {/* Main Content */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8">
              {/* Summary if available */}
              {entry.summary && (
                <p className="text-lg text-gray-700 dark:text-gray-300 italic mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                  {entry.summary}
                </p>
              )}

              {/* Content */}
              <div className="prose dark:prose-invert max-w-none mb-8">
                <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {entry.content}
                </div>
              </div>

          {/* Media Gallery */}
          {entry.media && entry.media.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                📷 Gallery
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {entry.media.map((media) => (
                  <div key={media.id} className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                    {media.type === 'image' ? (
                      <img
                        src={getMediaUrl(media.url)}
                        alt={media.description || media.originalName}
                        className="w-full h-auto"
                      />
                    ) : media.type === 'video' ? (
                      <video
                        src={getMediaUrl(media.url)}
                        controls
                        className="w-full h-auto"
                      />
                    ) : (
                      <div className="p-4 flex items-center justify-center h-40">
                        <a
                          href={media.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          📄 {media.originalName}
                        </a>
                      </div>
                    )}
                    {media.description && (
                      <p className="p-3 text-sm text-gray-600 dark:text-gray-400">{media.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Embeds */}
          {entry.embeds && entry.embeds.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                🔗 Embedded Content
              </h2>
              <div className="space-y-6">
                {entry.embeds.map((embed) => (
                  <EmbedPreview key={embed.id} embed={embed} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Interaction Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handleLike}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <span className={`text-2xl ${
                isLiked ? 'text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'
              }`}>{isLiked ? '❤' : '♡'}</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">{likes}</span>
            </button>
          </div>

          {/* Comments Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              💬 Comments ({comments.length})
            </h2>

            <form onSubmit={handleCommentSubmit} className="mb-6 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
              <input
                type="text"
                value={newCommentName}
                onChange={(e) => setNewCommentName(e.target.value)}
                placeholder="Your name (optional, shows as Anonymous if blank)"
                className="w-full px-4 py-3 border-b border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
              />
              <div className="flex gap-2 p-4 bg-gray-50 dark:bg-gray-800">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="flex-grow px-0 py-0 bg-transparent dark:bg-transparent dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
                />
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!newComment.trim()}
                >
                  Post
                </Button>
              </div>
              {!token && (
                <p className="px-4 pb-3 text-xs text-gray-500 dark:text-gray-400">
                  💡 Anonymous comments are moderated and will appear after admin approval.
                </p>
              )}
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">No comments yet. Be the first to comment!</p>
              ) : (
                comments.map((comment) => {
                  const isPending = comment.moderationStatus === 'pending';
                  const isOwnComment = (user && user.id === comment.userId) || 
                                       (!user && sessionToken && comment.sessionToken === sessionToken);
                  
                  return (
                    <div key={comment.id}>
                      {/* Show pending notice for own comments */}
                      {isPending && isOwnComment && (
                        <div className="mb-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                          <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            ⏳ Your comment is awaiting moderation and will be visible to others once approved by an admin.
                          </p>
                        </div>
                      )}
                      
                      <div className={`p-4 rounded-lg ${
                        isPending 
                          ? 'bg-yellow-50/50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/50' 
                          : 'bg-gray-50 dark:bg-gray-700'
                      }`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-grow">
                            <div className="flex items-center gap-2">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {comment.name || 'Anonymous'}
                              </div>
                              {isPending && user?.role === 'admin' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                  Pending
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-gray-800 dark:text-gray-200">{comment.text}</p>
                          </div>
                          {user && (user.id === comment.userId || user.role === 'admin') && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="ml-4 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
          </>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Delete Entry?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete this entry? This will also delete all associated comments. This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeleteEntry}
                >
                  Delete Entry
                </Button>
              </div>
            </div>
          </div>
        )}
      </article>
    </PageLayout>
  );
}
