'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { PageLayout } from '@/components/PageLayout';

export default function NewPostPage() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [uploadedMedia, setUploadedMedia] = useState<any[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [embeds, setEmbeds] = useState<Array<{ url: string; title?: string; description?: string }>>([]);
  const [embedUrl, setEmbedUrl] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    entryDate: new Date().toISOString().split('T')[0],
    status: 'draft',
    tags: '',
  });

  useEffect(() => {
    // Give time for auth to initialize from localStorage
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (!isAuthenticated) {
        router.push('/login');
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : [],
      };

      const newEntry = await api.entries.create(token!, payload);
      
      // Attach uploaded media to the entry
      if (uploadedMedia.length > 0) {
        for (const media of uploadedMedia) {
          await api.media.upload(token!, media.file, newEntry.id);
        }
      }

      // Create embeds for the entry
      if (embeds.length > 0) {
        for (const embed of embeds) {
          await api.embeds.create(token!, { url: embed.url, type: 'custom', entryId: newEntry.id });
        }
      }
      
      // Redirect to home page to see the new post
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
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
      setError(err.message || 'Failed to process files');
    } finally {
      setUploadingFile(false);
    }
  };

  const removeMedia = (index: number) => {
    setUploadedMedia(uploadedMedia.filter((_, i) => i !== index));
  };

  const handleAddEmbed = () => {
    if (!embedUrl.trim()) return;
    
    setEmbeds([...embeds, { url: embedUrl.trim() }]);
    setEmbedUrl('');
  };

  const removeEmbed = (index: number) => {
    setEmbeds(embeds.filter((_, i) => i !== index));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            ✏️ Add New Post
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create a new timeline entry for your portfolio
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
          <FormField
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter post title"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              rows={10}
              placeholder="Write your post content here... (Markdown supported)"
              required
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              You can use Markdown formatting for your content
            </p>
          </div>

          <FormField
            label="Summary"
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            placeholder="Brief summary of the post"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Entry Date"
              name="entryDate"
              type="date"
              value={formData.entryDate}
              onChange={handleChange}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <FormField
            label="Tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="travel, photography, food (comma-separated)"
          />

          {/* Media Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              📎 Attach Media
            </label>
            <input
              type="file"
              onChange={handleFileUpload}
              accept="image/*,video/*"
              multiple
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-900 dark:file:text-indigo-200 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-800"
              disabled={uploadingFile}
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Upload images or videos to include in your entry
            </p>
            
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

          {/* Embed Links Section */}
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
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Add URLs to show link previews in your entry
            </p>
            
            {embeds.length > 0 && (
              <div className="mt-4 space-y-2">
                {embeds.map((embed, index) => (
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

          <div className="flex gap-4">
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Post'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}
