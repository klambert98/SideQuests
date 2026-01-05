'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Entry } from '@/types';
import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';

export default function DashboardPage() {
  const router = useRouter();
  const { token, user, isAuthenticated } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    entryDate: new Date().toISOString().split('T')[0],
    status: 'draft',
    tags: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!token || !isAuthenticated) return;

    const fetchEntries = async () => {
      try {
        const result = await api.entries.getAll(1, 20);
        setEntries(result.data || []);
      } catch (error) {
        console.error('Failed to fetch entries:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntries();
  }, [token, isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSubmitting(true);
    try {
      const newEntry = await api.entries.create(token, {
        ...formData,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      });

      setEntries([newEntry, ...entries]);
      setFormData({
        title: '',
        content: '',
        summary: '',
        entryDate: new Date().toISOString().split('T')[0],
        status: 'draft',
        tags: '',
      });
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome, {user?.name || 'User'}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Entry Button */}
        <div className="mb-6">
          <Button
            onClick={() => setShowForm(!showForm)}
            variant="primary"
          >
            {showForm ? 'Cancel' : '+ New Entry'}
          </Button>
        </div>

        {/* Create Entry Form */}
        {showForm && (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 mb-8 border border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              Create New Entry
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                label="Title"
                name="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.currentTarget.value })}
                placeholder="Entry title"
                required
              />

              <FormField
                label="Content"
                name="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.currentTarget.value })}
                placeholder="Write your entry content..."
                rows={6}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Date"
                  name="entryDate"
                  type="date"
                  value={formData.entryDate}
                  onChange={(e) => setFormData({ ...formData, entryDate: e.currentTarget.value })}
                />

                <FormField
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.currentTarget.value })}
                  options={[
                    { value: 'draft', label: 'Draft' },
                    { value: 'published', label: 'Published' },
                  ]}
                />
              </div>

              <FormField
                label="Summary"
                name="summary"
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.currentTarget.value })}
                placeholder="Brief summary of the entry"
              />

              <FormField
                label="Tags (comma-separated)"
                name="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.currentTarget.value })}
                placeholder="travel, photography, life"
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={isSubmitting}
              >
                Create Entry
              </Button>
            </form>
          </div>
        )}

        {/* Entries List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Your Entries
          </h2>

          {isLoading ? (
            <div className="text-center py-12">Loading entries...</div>
          ) : entries.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 p-8 rounded-lg text-center border border-gray-200 dark:border-gray-800">
              <p className="text-gray-600 dark:text-gray-400">
                No entries yet. Create your first one!
              </p>
            </div>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-800 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {entry.title}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      entry.status === 'published'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}
                  >
                    {entry.status}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                  {new Date(entry.entryDate).toLocaleDateString()}
                </p>
                {entry.summary && (
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {entry.summary}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary">
                    Edit
                  </Button>
                  <Button size="sm" variant="danger">
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
