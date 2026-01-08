'use client';

import { useEffect, useState } from 'react';

type BucketListFormProps = {
  categories: string[];
  subcategoriesByCategory: Record<string, string[]>;
  onAdd: (title: string, category: string, subcategory?: string) => void;
  onCancel: () => void;
};

export function BucketListForm({ categories, subcategoriesByCategory, onAdd, onCancel }: BucketListFormProps) {
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0] || '');
  const [subcategory, setSubcategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!selectedCategory && categories.length > 0) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);

  const availableSubcategories = subcategoriesByCategory[selectedCategory] || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedCategory = selectedCategory.trim();
    const trimmedSubcategory = subcategory.trim();

    if (!trimmedTitle) {
      alert('Please enter an item title');
      return;
    }

    if (!trimmedCategory) {
      alert('Please select a category');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      onAdd(trimmedTitle, trimmedCategory, trimmedSubcategory || undefined);
      setTitle('');
      setSelectedCategory(trimmedCategory || categories[0] || '');
      setSubcategory('');
      setIsSubmitting(false);
    }, 300);
  };

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Add New Bucket List Item</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Input */}
          <div>
            <label htmlFor="item-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Item Title *
            </label>
            <input
              id="item-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Learn to play guitar"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isSubmitting}
            />
          </div>

          {/* Category Select */}
          <div>
            <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category *
            </label>
            <input
              id="category-select"
              list="category-options"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSubcategory('');
              }}
              placeholder="Start typing to add or select a category"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isSubmitting}
            />
            <datalist id="category-options">
              {categories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Type to create a new category or pick an existing one.</p>
          </div>

          {/* Subcategory Input */}
          <div>
            <label htmlFor="subcategory-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subcategory (optional)
            </label>
            <input
              id="subcategory-input"
              list="subcategory-options"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              placeholder={selectedCategory ? 'Type to add or select a subcategory' : 'Select a category first'}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isSubmitting || !selectedCategory}
            />
            <datalist id="subcategory-options">
              {availableSubcategories.map((subcat) => (
                <option key={subcat} value={subcat} />
              ))}
            </datalist>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Leave empty to skip, or type to add a new subcategory.</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Adding...' : 'Add Item'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 px-6 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
