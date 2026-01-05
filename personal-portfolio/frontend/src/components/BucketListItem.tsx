'use client';

type BucketListItem = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  category: string;
  timelineEntryId?: string;
};

type BucketListItemProps = {
  item: BucketListItem;
  onToggle?: (id: string) => void;
};

export function BucketListItemComponent({ item, onToggle }: BucketListItemProps) {
  return (
    <li className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition bg-white dark:bg-gray-800">
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={item.completed}
          onChange={() => onToggle?.(item.id)}
          className="mt-1 w-5 h-5 text-indigo-600 rounded cursor-pointer accent-indigo-600"
        />
        <div className="flex-grow">
          <span
            className={`text-base font-medium transition ${
              item.completed
                ? 'line-through text-gray-500 dark:text-gray-500'
                : 'text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
            }`}
          >
            {item.title}
          </span>
          {item.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
          )}
        </div>
      </label>
    </li>
  );
}
