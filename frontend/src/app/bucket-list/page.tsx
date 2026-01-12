'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ContentSection } from '@/components/ContentSection';
import { BucketListGroup } from '@/components/BucketListGroup';
import { BucketListForm } from '@/components/BucketListForm';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/contexts/ToastContext';

export type BucketListItem = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  timelineEntryId?: string;
  category: string;
  subcategory?: string;
  parentId?: string;
  children?: BucketListItem[];
};

type BucketListUpdatePayload = {
  title: string;
  description?: string;
  category: string;
  subcategory?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function BucketListPage() {
  const [bucketListData, setBucketListData] = useState<Record<string, BucketListItem[]>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated, token } = useAuth();
  const { addToast } = useToast();
  const isAdmin = user?.role === 'admin';

  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    // Include grouped category keys
    Object.keys(bucketListData).forEach((c) => set.add(c));
    // Include categories from all items and nested children
    const collect = (items: BucketListItem[]) => {
      items.forEach((it) => {
        if (it.category) set.add(it.category);
        if (it.children && it.children.length) collect(it.children);
      });
    };
    Object.values(bucketListData).forEach((arr) => collect(arr));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [bucketListData]);

  const subcategoriesByCategory = useMemo(() => {
    const map: Record<string, string[]> = {};

    const collectSubcategories = (items: BucketListItem[], set: Set<string>) => {
      items.forEach((item) => {
        if (item.subcategory) {
          set.add(item.subcategory);
        }
        if (item.children && item.children.length > 0) {
          collectSubcategories(item.children, set);
        }
      });
    };

    Object.entries(bucketListData).forEach(([category, items]) => {
      const bucketSubcategories = new Set<string>();
      collectSubcategories(items, bucketSubcategories);
      map[category] = Array.from(bucketSubcategories).sort((a, b) => a.localeCompare(b));
    });

    return map;
  }, [bucketListData]);

  // Fetch bucket list items from API
  useEffect(() => {
    const fetchBucketList = async () => {
      try {
        setIsLoading(true);
        const headers: HeadersInit = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
        
        const response = await fetch(`${API_URL}/bucket-list`, {
          headers,
        });

        if (!response.ok) {
          throw new Error('Failed to fetch bucket list');
        }

        const data = await response.json();
        setBucketListData(data);

        // Set all categories to expanded by default
        const allCategories = Object.keys(data);
        setExpandedCategories(
          allCategories.reduce((acc, cat) => ({ ...acc, [cat]: true }), {})
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load bucket list');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBucketList();
  }, [token]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const toggleItemCompletion = async (itemId: string, category: string) => {
    if (!token) return;

    // Helper to find item recursively
    const findItem = (items: BucketListItem[]): BucketListItem | null => {
      for (const item of items) {
        if (item.id === itemId) return item;
        if (item.children) {
          const found = findItem(item.children);
          if (found) return found;
        }
      }
      return null;
    };

    const item = findItem(bucketListData[category] || []);
    if (!item) return;

    try {
      const response = await fetch(`${API_URL}/bucket-list/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: !item.completed }),
      });

      if (!response.ok) {
        throw new Error('Failed to update item');
      }

      const updatedItem = await response.json();

      // Update local state recursively
      const updateItemRecursively = (items: BucketListItem[]): BucketListItem[] => {
        return items.map(i => {
          if (i.id === itemId) {
            return { ...i, completed: updatedItem.completed };
          }
          if (i.children) {
            return { ...i, children: updateItemRecursively(i.children) };
          }
          return i;
        });
      };

      setBucketListData((prev) => ({
        ...prev,
        [category]: updateItemRecursively(prev[category] || []),
      }));
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : 'Failed to update item',
        'error'
      );
    }
  };

  const removeItem = async (itemId: string, category: string) => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/bucket-list/${itemId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      // Remove item recursively
      const removeItemRecursively = (items: BucketListItem[]): BucketListItem[] => {
        return items.filter(i => i.id !== itemId).map(i => {
          if (i.children) {
            return { ...i, children: removeItemRecursively(i.children) };
          }
          return i;
        });
      };

      setBucketListData((prev) => ({
        ...prev,
        [category]: removeItemRecursively(prev[category] || []),
      }));
      addToast('Item removed successfully', 'success');
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : 'Failed to delete item',
        'error'
      );
    }
  };

  const updateItem = async (
    itemId: string,
    category: string,
    updates: BucketListUpdatePayload,
  ) => {
    if (!token) return;

    const normalizedPayload: BucketListUpdatePayload = {
      title: updates.title.trim(),
      description: updates.description?.trim() || undefined,
      category: updates.category.trim(),
      subcategory: updates.subcategory?.trim() || undefined,
    };

    if (!normalizedPayload.title || !normalizedPayload.category) {
      addToast('Title and category are required', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/bucket-list/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(normalizedPayload),
      });

      if (!response.ok) {
        throw new Error('Failed to update item');
      }

      const updatedItem = await response.json();

      setBucketListData((prev) => {
        const sourceItems = prev[category] || [];
        let movedTopLevel: BucketListItem | null = null;

        const updateRecursively = (items: BucketListItem[]): BucketListItem[] => {
          return items
            .map((item) => {
              if (item.id === itemId) {
                const mergedItem: BucketListItem = {
                  ...item,
                  ...updatedItem,
                  children: item.children,
                };

                // Only move top-level items across categories
                if (!mergedItem.parentId && mergedItem.category !== category) {
                  movedTopLevel = mergedItem;
                  return null;
                }

                return mergedItem;
              }

              if (item.children && item.children.length > 0) {
                const updatedChildren = updateRecursively(item.children);
                if (updatedChildren !== item.children) {
                  return { ...item, children: updatedChildren };
                }
              }

              return item;
            })
            .filter((item): item is BucketListItem => Boolean(item));
        };

        const updatedSourceItems = updateRecursively(sourceItems);

        let nextState: Record<string, BucketListItem[]> = {
          ...prev,
          [category]: updatedSourceItems,
        };

        if (movedTopLevel) {
          const destinationCategory = normalizedPayload.category;
          const destinationItems = prev[destinationCategory] || [];
          nextState = {
            ...nextState,
            [destinationCategory]: [...destinationItems, movedTopLevel],
          };
        }

        return nextState;
      });

      if (normalizedPayload.category !== category) {
        setExpandedCategories((prev) => ({ ...prev, [normalizedPayload.category]: true }));
      }

      addToast('Item updated successfully', 'success');
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : 'Failed to update item',
        'error'
      );
    }
  };

  const reorderItems = async (category: string, itemIds: string[]) => {
    if (!token) return;

    // Optimistically update the UI
    setBucketListData((prev) => {
      const categoryItems = prev[category];
      const itemMap = new Map(categoryItems.map(item => [item.id, item]));
      const reorderedItems = itemIds.map(id => itemMap.get(id)!).filter(Boolean);
      
      return {
        ...prev,
        [category]: reorderedItems,
      };
    });

    try {
      const response = await fetch(`${API_URL}/bucket-list/reorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ category, itemIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder items');
      }
    } catch (err) {
      // Revert on error by refetching
      addToast(
        err instanceof Error ? err.message : 'Failed to reorder items',
        'error'
      );
      // Optionally refetch the data to restore correct order
    }
  };

  const addItem = async (title: string, category: string, subcategory?: string, description?: string, parentId?: string) => {
    if (!token) return;

    const trimmedTitle = title.trim();
    const normalizedCategory = category.trim();
    const normalizedSubcategory = subcategory?.trim() || undefined;
    const normalizedDescription = description?.trim() || undefined;

    if (!trimmedTitle) {
      addToast('Please provide a title for the item', 'error');
      return;
    }

    if (!normalizedCategory) {
      addToast('Please provide a category for the item', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/bucket-list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: trimmedTitle, description: normalizedDescription, category: normalizedCategory, subcategory: normalizedSubcategory, parentId, completed: false }),
      });

      if (!response.ok) {
        throw new Error('Failed to add item');
      }

      const newItem = await response.json();

      if (parentId) {
        // Add as child item
        const addChildRecursively = (items: BucketListItem[]): BucketListItem[] => {
          return items.map(i => {
            if (i.id === parentId) {
              return { ...i, children: [...(i.children || []), newItem] };
            }
            if (i.children) {
              return { ...i, children: addChildRecursively(i.children) };
            }
            return i;
          });
        };

        setBucketListData((prev) => ({
          ...prev,
          [normalizedCategory]: addChildRecursively(prev[normalizedCategory] || []),
        }));
      } else {
        // Add as top-level item
        setBucketListData((prev) => ({
          ...prev,
          [normalizedCategory]: [...(prev[normalizedCategory] || []), newItem],
        }));
        setExpandedCategories((prev) => ({ ...prev, [normalizedCategory]: true }));
      }

      setShowAddForm(false);
      addToast('Item added successfully', 'success');
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : 'Failed to add item',
        'error'
      );
    }
  };

  // Calculate total progress with parent items contributing their child completion percentage
  const calculateProgress = () => {
    const allItems = Object.values(bucketListData).flat();
    let totalWeight = 0;
    let completedWeight = 0;

    allItems.forEach((item) => {
      if (item.children && item.children.length > 0) {
        // Parent item: count based on child completion percentage
        const childrenCompleted = item.children.filter((c) => c.completed).length;
        const childrenTotal = item.children.length;
        totalWeight += 1;
        completedWeight += childrenCompleted / childrenTotal;
      } else if (!item.parentId) {
        // Leaf item without children: count as 0 or 1
        totalWeight += 1;
        completedWeight += item.completed ? 1 : 0;
      }
      // Skip child items (they're counted as part of their parent)
    });

    return {
      totalItems: totalWeight,
      completedItems: completedWeight,
      progressPercentage: totalWeight === 0 ? 0 : Math.round((completedWeight / totalWeight) * 100),
    };
  };

  const { totalItems, completedItems, progressPercentage } = calculateProgress();

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
            A collection of experiences, goals, and side quests I&apos;m working toward. Each item tracked with progress and completion status.
          </p>

          {/* Progress Bar */}
          {totalItems > 0 && (
            <div className="max-w-2xl mx-auto mt-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Overall Progress
                </span>
                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                  {completedItems.toFixed(1)} / {totalItems} completed ({progressPercentage}%)
                </span>
              </div>
              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}
        </ContentSection>
      </section>

      {/* Loading State */}
      {isLoading && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-600 dark:text-gray-300">Loading bucket list...</span>
            </div>
          </div>
        </section>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <p className="text-red-900 dark:text-red-100">{error}</p>
          </div>
        </section>
      )}

      {/* Admin Actions */}
      {isAuthenticated && isAdmin && !isLoading && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Item
          </button>
        </section>
      )}

      {/* Add New Item Form */}
      {showAddForm && isAdmin && !isLoading && (
        <BucketListForm
          categories={categoryOptions}
          subcategoriesByCategory={subcategoriesByCategory}
          onAdd={addItem}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Read-only notice for non-authenticated users */}
      {!isAuthenticated && !isLoading && totalItems > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-center">
            <p className="text-amber-900 dark:text-amber-100 text-sm">
              📖 You&apos;re viewing in read-only mode. <Link href="/login" className="underline font-semibold hover:text-amber-700 dark:hover:text-amber-300">Sign in</Link> to manage items.
            </p>
          </div>
        </section>
      )}

      {/* Bucket List Categories */}
      {!isLoading && totalItems > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="space-y-8">
            {Object.entries(bucketListData).map(([category, categoryItems]) => (
              <BucketListGroup
                key={category}
                category={category}
                items={categoryItems}
                isExpanded={expandedCategories[category]}
                onToggleExpand={() => toggleCategory(category)}
                onToggleItem={(itemId: string) => toggleItemCompletion(itemId, category)}
                onRemoveItem={(itemId: string) => removeItem(itemId, category)}
                onUpdateItem={(itemId: string, updates: BucketListUpdatePayload) => updateItem(itemId, category, updates)}
                onReorderItems={(itemIds: string[]) => reorderItems(category, itemIds)}
                onAddChild={(parentId: string, title: string) => addItem(title, category, undefined, parentId)}
                allCategories={categoryOptions}
                subcategoriesByCategory={subcategoriesByCategory}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {!isLoading && totalItems === 0 && !error && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-4">No bucket list items yet.</p>
            {isAdmin && (
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Your First Item
              </button>
            )}
          </div>
        </section>
      )}

      {/* Toast Notification is handled by ToastContainer globally */}

      <Footer />
    </div>
  );
}
