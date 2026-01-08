import { useState } from 'react';
import { BucketListItem } from '@/app/bucket-list/page';
import { BucketListItemComponent } from './BucketListItem';

type BucketListUpdateInput = {
  title: string;
  description?: string;
  category: string;
  subcategory?: string;
};

type BucketListGroupProps = {
  category: string;
  items: BucketListItem[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleItem: (itemId: string) => void;
  onRemoveItem: (itemId: string) => void;
  onUpdateItem: (itemId: string, updates: BucketListUpdateInput) => void;
  onReorderItems: (itemIds: string[]) => void;
  onAddChild?: (parentId: string, title: string) => void;
  allCategories: string[];
  subcategoriesByCategory: Record<string, string[]>;
  isAdmin: boolean;
};

export function BucketListGroup({
  category,
  items,
  isExpanded,
  onToggleExpand,
  onToggleItem,
  onRemoveItem,
  onUpdateItem,
  onReorderItems,
  onAddChild,
  allCategories,
  subcategoriesByCategory,
  isAdmin,
}: BucketListGroupProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  // Calculate category progress with parent items contributing their child completion percentage
  const { completedWeight, totalWeight } = items.reduce((acc, item) => {
    if (item.children && item.children.length > 0) {
      // Parent item: count based on child completion percentage
      const childrenCompleted = item.children.filter((c) => c.completed).length;
      const childrenTotal = item.children.length;
      acc.totalWeight += 1;
      acc.completedWeight += childrenCompleted / childrenTotal;
    } else {
      // Leaf item without children: count as 0 or 1
      acc.totalWeight += 1;
      acc.completedWeight += item.completed ? 1 : 0;
    }
    return acc;
  }, { completedWeight: 0, totalWeight: 0 });

  const categoryPercentage = totalWeight === 0 ? 0 : Math.round((completedWeight / totalWeight) * 100);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!isAdmin) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (!isAdmin || draggedIndex === null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    if (!isAdmin || draggedIndex === null) return;
    e.preventDefault();

    if (draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Reorder the items array
    const reorderedItems = [...items];
    const [movedItem] = reorderedItems.splice(draggedIndex, 1);
    reorderedItems.splice(dropIndex, 0, movedItem);

    // Call the reorder callback with new item order
    onReorderItems(reorderedItems.map(item => item.id));

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Category Header */}
      <button
        onClick={onToggleExpand}
        className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition group"
      >
        <div className="flex items-center gap-4 flex-1">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
            {category}
          </h2>
          <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
            {completedWeight.toFixed(1)} / {totalWeight} ({categoryPercentage}%)
          </span>
        </div>
        <svg
          className={`w-6 h-6 text-gray-600 dark:text-gray-400 transition-transform flex-shrink-0 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Category Progress Bar */}
      <div className="px-6 pb-2">
        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-300"
            style={{ width: `${categoryPercentage}%` }}
          />
        </div>
      </div>

      {/* Category Items */}
      {isExpanded && (
        <div className="px-6 pb-6 space-y-2 pt-4">
          {items.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">No items in this category</p>
          ) : (
            <>
              {isAdmin && items.length > 1 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                  Drag to reorder
                </p>
              )}
              {(() => {
                // Group items by subcategory
                const grouped = items.reduce((acc, item) => {
                  const subcat = item.subcategory || '';
                  if (!acc[subcat]) acc[subcat] = [];
                  acc[subcat].push(item);
                  return acc;
                }, {} as Record<string, typeof items>);

                return Object.entries(grouped).map(([subcategory, subcatItems]) => (
                  <div key={subcategory || 'default'}>
                    {subcategory && (
                      <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mt-4 mb-2">
                        {subcategory}
                      </h3>
                    )}
                    {subcatItems.map((item) => {
                      const globalIndex = items.indexOf(item);
                      return (
                        <div
                          key={item.id}
                          draggable={isAdmin}
                          onDragStart={(e) => handleDragStart(e, globalIndex)}
                          onDragOver={(e) => handleDragOver(e, globalIndex)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, globalIndex)}
                          onDragEnd={handleDragEnd}
                          className={`relative transition-all mb-2 ${
                            draggedIndex === globalIndex ? 'opacity-50 scale-95' : ''
                          } ${
                            dragOverIndex === globalIndex && draggedIndex !== globalIndex
                              ? 'border-t-2 border-indigo-500 pt-2'
                              : ''
                          }`}
                        >
                          {isAdmin && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 cursor-move opacity-0 group-hover:opacity-100 transition">
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                              </svg>
                            </div>
                          )}
                          <BucketListItemComponent
                            item={item}
                            onToggle={onToggleItem}
                            onRemove={onRemoveItem}
                            onUpdate={onUpdateItem}
                            onAddChild={onAddChild}
                            categories={allCategories}
                            subcategoriesByCategory={subcategoriesByCategory}
                            isAdmin={isAdmin}
                          />
                        </div>
                      );
                    })}
                  </div>
                ));
              })()}
            </>
          )}
        </div>
      )}
    </div>
  );
}
