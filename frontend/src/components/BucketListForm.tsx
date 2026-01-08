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
  const [useNewCategory, setUseNewCategory] = useState(false);
  const [newCategoryText, setNewCategoryText] = useState('');
  const [useNewSubcategory, setUseNewSubcategory] = useState(false);
  const [newSubcategoryText, setNewSubcategoryText] = useState('');
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
    const effectiveCategory = (useNewCategory ? newCategoryText : selectedCategory).trim();
    const effectiveSubcategory = (useNewSubcategory ? newSubcategoryText : subcategory).trim();

    if (!trimmedTitle) {
      alert('Please enter an item title');
      return;
    }

    if (!effectiveCategory) {
      alert('Please select a category');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      onAdd(trimmedTitle, effectiveCategory, effectiveSubcategory || undefined);
      setTitle('');
      setSelectedCategory(effectiveCategory || categories[0] || '');
      setSubcategory('');
      setUseNewCategory(false);
      setNewCategoryText('');
      setUseNewSubcategory(false);
      setNewSubcategoryText('');
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
            <select
              id="category-select"
              value={useNewCategory ? '__NEW__' : selectedCategory}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '__NEW__') {
                  setUseNewCategory(true);
                  setSelectedCategory('');
                } else {
                  setUseNewCategory(false);
                  setSelectedCategory(val);
                }
                setSubcategory('');
                setUseNewSubcategory(false);
                setNewSubcategoryText('');
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isSubmitting}
            >
              {[...categories].sort((a,b)=>a.localeCompare(b)).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
              <option value="__NEW__">+ Add new category…</option>
            </select>
            {useNewCategory && (
              <input
                type="text"
                value={newCategoryText}
                onChange={(e) => setNewCategoryText(e.target.value)}
                placeholder="Enter new category name"
                className="mt-2 w-full px-4 py-2 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isSubmitting}
              />
            )}
          </div>

          {/* Subcategory Select */}
          <div>
            <label htmlFor="subcategory-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subcategory (optional)
            </label>
            <select
              id="subcategory-input"
              value={useNewSubcategory ? '__NEW__' : (subcategory || '')}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '__NEW__') {
                  setUseNewSubcategory(true);
                  setSubcategory('');
                } else {
                  setUseNewSubcategory(false);
                  setNewSubcategoryText('');
                  setSubcategory(val);
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isSubmitting || !(useNewCategory ? newCategoryText.trim() : selectedCategory)}
            >
              <option value="">(none)</option>
              {[...availableSubcategories].sort((a,b)=>a.localeCompare(b)).map((subcat) => (
                <option key={subcat} value={subcat}>
                  {subcat}
                </option>
              ))}
              <option value="__NEW__">+ Add new subcategory…</option>
            </select>
            {useNewSubcategory && (
              <input
                type="text"
                value={newSubcategoryText}
                onChange={(e) => setNewSubcategoryText(e.target.value)}
                placeholder="Enter new subcategory name"
                className="mt-2 w-full px-4 py-2 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isSubmitting}
              />
            )}
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
