'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { api } from '@/lib/api';
import { PageLayout } from '@/components/PageLayout';
import type { Entry } from '@/types';
import Link from 'next/link';

function EntriesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, isAuthenticated } = useAuth();
  
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // Search/filter states
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Bulk edit states
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkTags, setBulkTags] = useState('');
  const [bulkDate, setBulkDate] = useState('');

  useEffect(() => {
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

    const fetchEntries = async () => {
      try {
        const result = await api.entries.getAll(1, 1000); // Fetch all entries
        let filteredEntries = result.data || [];

        // Apply filters
        if (statusFilter !== 'all') {
          filteredEntries = filteredEntries.filter((e: Entry) => e.status === statusFilter);
        }

        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filteredEntries = filteredEntries.filter((e: Entry) => 
            e.title.toLowerCase().includes(query) ||
            e.content.toLowerCase().includes(query) ||
            e.summary?.toLowerCase().includes(query)
          );
        }

        if (tagFilter) {
          filteredEntries = filteredEntries.filter((e: Entry) => 
            e.tags && e.tags.some(tag => tag.toLowerCase().includes(tagFilter.toLowerCase()))
          );
        }

        if (dateFrom) {
          filteredEntries = filteredEntries.filter((e: Entry) => 
            new Date(e.entryDate) >= new Date(dateFrom)
          );
        }

        if (dateTo) {
          filteredEntries = filteredEntries.filter((e: Entry) => 
            new Date(e.entryDate) <= new Date(dateTo)
          );
        }

        // Sort by date, newest first
        filteredEntries.sort((a: Entry, b: Entry) => 
          new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
        );

        setEntries(filteredEntries);
      } catch (error) {
        console.error('Failed to fetch entries:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntries();
  }, [authChecked, isAuthenticated, statusFilter, searchQuery, tagFilter, dateFrom, dateTo]);

  const toggleEntrySelection = (id: string) => {
    const newSelected = new Set(selectedEntries);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedEntries(newSelected);
  };

  const selectAll = () => {
    if (selectedEntries.size === entries.length) {
      setSelectedEntries(new Set());
    } else {
      setSelectedEntries(new Set(entries.map(e => e.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (!token || selectedEntries.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedEntries.size} entries? This cannot be undone.`)) {
      return;
    }

    try {
      await Promise.all(
        Array.from(selectedEntries).map(id => api.entries.delete(token, id))
      );
      
      // Refresh entries
      setEntries(entries.filter(e => !selectedEntries.has(e.id)));
      setSelectedEntries(new Set());
      setShowBulkActions(false);
    } catch (error) {
      console.error('Failed to delete entries:', error);
      alert('Failed to delete some entries');
    }
  };

  const handleBulkUpdate = async () => {
    if (!token || selectedEntries.size === 0) return;

    const updates: Partial<Entry> = {};
    if (bulkStatus) updates.status = bulkStatus as 'draft' | 'published' | 'archived';
    if (bulkDate) updates.entryDate = new Date(bulkDate);
    if (bulkTags) {
      const newTags = bulkTags.split(',').map(t => t.trim()).filter(Boolean);
      updates.tags = newTags;
    }

    if (Object.keys(updates).length === 0) {
      alert('Please select at least one field to update');
      return;
    }

    try {
      await Promise.all(
        Array.from(selectedEntries).map(id => api.entries.update(token, id, updates))
      );
      
      // Refresh page
      window.location.reload();
    } catch (error) {
      console.error('Failed to update entries:', error);
      alert('Failed to update some entries');
    }
  };

  if (!authChecked || !isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading entries...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            📚 Manage Entries
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Search, filter, and manage your blog entries
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search
              </label>
              <input
                type="text"
                placeholder="Search title, content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tag
              </label>
              <input
                type="text"
                placeholder="Filter by tag..."
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date From
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date To
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setTagFilter('');
                  setDateFrom('');
                  setDateTo('');
                }}
                className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions Section */}
        {selectedEntries.size > 0 && (
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedEntries.size} {selectedEntries.size === 1 ? 'entry' : 'entries'} selected
              </h3>
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                {showBulkActions ? 'Hide' : 'Show'} Bulk Actions
              </button>
            </div>

            {showBulkActions && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Update Status
                    </label>
                    <select
                      value={bulkStatus}
                      onChange={(e) => setBulkStatus(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Keep current</option>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Update Date
                    </label>
                    <input
                      type="date"
                      value={bulkDate}
                      onChange={(e) => setBulkDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Replace Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="tag1, tag2, tag3"
                      value={bulkTags}
                      onChange={(e) => setBulkTags(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleBulkUpdate}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Apply Updates
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Delete Selected
                  </button>
                  <button
                    onClick={() => setSelectedEntries(new Set())}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600 dark:text-gray-400">
            Showing {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </p>
          <button
            onClick={selectAll}
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {selectedEntries.size === entries.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        {/* Entries List */}
        <div className="space-y-4">
          {entries.length > 0 ? (
            entries.map((entry) => (
              <div
                key={entry.id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition ${
                  selectedEntries.has(entry.id) ? 'ring-2 ring-indigo-500' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedEntries.has(entry.id)}
                    onChange={() => toggleEntrySelection(entry.id)}
                    className="mt-1 w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <Link href={`/entries/${entry.id}`}>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">
                            {entry.title}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`px-2 py-1 text-xs rounded ${
                            entry.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            entry.status === 'draft' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}>
                            {entry.status}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(entry.entryDate).toLocaleDateString()}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            👁️ {entry.views || 0} views
                          </span>
                        </div>
                      </div>
                      <Link href={`/entries/${entry.id}`}>
                        <button className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                          Edit
                        </button>
                      </Link>
                    </div>

                    {entry.summary && (
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        {entry.summary}
                      </p>
                    )}

                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {entry.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                No entries found matching your criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

export default function EntriesPage() {
  return (
    <Suspense fallback={
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </PageLayout>
    }>
      <EntriesContent />
    </Suspense>
  );
}
