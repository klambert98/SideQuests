'use client';

import { useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';

type BucketListItem = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  category: string;
  subcategory?: string;
  timelineEntryId?: string;
  parentId?: string;
  children?: BucketListItem[];
};

type BucketListItemProps = {
  item: BucketListItem;
  onToggle?: (id: string) => void;
  onRemove?: (id: string) => void;
  onUpdate?: (id: string, updates: { title: string; description?: string; category: string; subcategory?: string }) => void;
  onAddChild?: (parentId: string, title: string) => void;
  categories: string[];
  subcategoriesByCategory: Record<string, string[]>;
  isAdmin?: boolean;
};

export function BucketListItemComponent({ item, onToggle, onRemove, onUpdate, onAddChild, categories, subcategoriesByCategory, isAdmin = false }: BucketListItemProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [editDescription, setEditDescription] = useState(item.description || '');
  const [editCategory, setEditCategory] = useState(item.category);
  const [editSubcategory, setEditSubcategory] = useState(item.subcategory || '');
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [newChildTitle, setNewChildTitle] = useState('');

  const availableSubcategories = subcategoriesByCategory[editCategory] || [];
  const categoryListId = `category-options-${item.id}`;
  const categoryInputId = `${categoryListId}-input`;
  const subcategoryListId = `subcategory-options-${item.id}`;
  const subcategoryInputId = `${subcategoryListId}-input`;

  const handleDelete = () => {
    onRemove?.(item.id);
    setShowDeleteConfirm(false);
  };

  const handleEdit = () => {
    setEditTitle(item.title);
    setEditDescription(item.description || '');
    setEditCategory(item.category);
    setEditSubcategory(item.subcategory || '');
    setIsEditing(true);
  };

  const handleSave = () => {
    const trimmedTitle = editTitle.trim();
    const trimmedCategory = editCategory.trim();
    const trimmedDescription = editDescription.trim();
    const trimmedSubcategory = editSubcategory.trim();

    if (!trimmedTitle || !trimmedCategory) {
      return;
    }

    onUpdate?.(item.id, {
      title: trimmedTitle,
      description: trimmedDescription || undefined,
      category: trimmedCategory,
      subcategory: trimmedSubcategory || undefined,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(item.title);
    setEditDescription(item.description || '');
    setEditCategory(item.category);
    setEditSubcategory(item.subcategory || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleAddChild = () => {
    if (newChildTitle.trim() && onAddChild) {
      onAddChild(item.id, newChildTitle.trim());
      setNewChildTitle('');
      setIsAddingChild(false);
    }
  };

  const handleChildKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddChild();
    } else if (e.key === 'Escape') {
      setNewChildTitle('');
      setIsAddingChild(false);
    }
  };

  return (
    <>
      <div
        className={`flex items-start gap-4 p-4 rounded-xl border transition group ${
          item.completed
            ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
            : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
        }`}
      >
        {/* Checkbox */}
        <div className="flex-shrink-0 mt-1">
          <input
            type="checkbox"
            checked={item.completed}
            onChange={() => onToggle?.(item.id)}
            disabled={!isAdmin || isEditing}
            className={`w-5 h-5 rounded accent-indigo-600 cursor-pointer transition ${
              !isAdmin || isEditing ? 'cursor-not-allowed opacity-60' : ''
            }`}
          />
        </div>

        {/* Content */}
        <div className="flex-grow">
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-3 py-1.5 rounded-md border border-indigo-300 dark:border-indigo-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Title"
                autoFocus
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-600 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Description (optional)"
                rows={2}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label htmlFor={categoryInputId} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Category *
                  </label>
                  <input
                    id={categoryInputId}
                    list={categoryListId}
                    value={editCategory}
                    onChange={(e) => {
                      setEditCategory(e.target.value);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Type to add/select"
                    className="w-full px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <datalist id={categoryListId}>
                    {categories.map((category) => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label htmlFor={subcategoryInputId} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Subcategory
                  </label>
                  <input
                    id={subcategoryInputId}
                    list={subcategoryListId}
                    value={editSubcategory}
                    onChange={(e) => setEditSubcategory(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Optional"
                    className="w-full px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <datalist id={subcategoryListId}>
                    {availableSubcategories.map((subcat) => (
                      <option key={subcat} value={subcat} />
                    ))}
                  </datalist>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="px-3 py-1 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h3
                className={`font-semibold transition ${
                  item.completed
                    ? 'text-gray-700 dark:text-gray-300 line-through'
                    : 'text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                }`}
              >
                {item.title}
              </h3>
              {item.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
              )}
              {/* Progress bar for parent items with children */}
              {item.children && item.children.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {item.children.filter((c) => c.completed).length} / {item.children.length} completed
                    </span>
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      ({Math.round((item.children.filter((c) => c.completed).length / item.children.length) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 transition-all duration-300"
                      style={{ width: `${(item.children.filter((c) => c.completed).length / item.children.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Action Buttons (Admin Only) */}
        {isAdmin && !isEditing && (
          <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition">
            {onAddChild && !item.parentId && (
              <button
                onClick={() => setIsAddingChild(true)}
                className="p-2 text-gray-400 hover:text-green-500 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition"
                title="Add sub-item"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
            )}
            {onUpdate && (
              <button
                onClick={handleEdit}
                className="p-2 text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition"
                title="Edit item"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            )}
            {onRemove && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                title="Delete item"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Child Form */}
      {isAddingChild && isAdmin && (
        <div className="ml-12 mt-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={newChildTitle}
              onChange={(e) => setNewChildTitle(e.target.value)}
              onKeyDown={handleChildKeyDown}
              placeholder="Enter sub-item name..."
              className="flex-1 px-3 py-2 rounded-md border border-indigo-300 dark:border-indigo-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
            <button
              onClick={handleAddChild}
              disabled={!newChildTitle.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-md transition"
            >
              Add
            </button>
            <button
              onClick={() => {
                setNewChildTitle('');
                setIsAddingChild(false);
              }}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Child Items (Sub-list) */}
      {item.children && item.children.length > 0 && (
        <div className="ml-12 mt-2 space-y-1.5">
          {item.children.map((child) => (
            <BucketListItemComponent
              key={child.id}
              item={child}
              onToggle={onToggle}
              onRemove={onRemove}
              onUpdate={onUpdate}
              onAddChild={onAddChild}
              categories={categories}
              subcategoriesByCategory={subcategoriesByCategory}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Delete Item"
          message={`Are you sure you want to delete "${item.title}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          confirmText="Delete"
          cancelText="Keep"
          isDangerous={true}
        />
      )}
    </>
  );
}
