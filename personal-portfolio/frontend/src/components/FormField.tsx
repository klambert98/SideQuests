'use client';

type FormFieldProps = {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  error?: string;
  options?: Array<{ value: string; label: string }>;
};

export function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  rows,
  error,
  options,
}: FormFieldProps) {
  let Component: React.ElementType;
  const inputProps: Record<string, any> = { name, value, onChange, required };

  if (rows) {
    Component = 'textarea';
    inputProps.rows = rows;
  } else if (options) {
    Component = 'select';
  } else {
    Component = 'input';
    inputProps.type = type;
  }

  const baseClasses = 'w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition';
  const errorClasses = error
    ? 'border-red-500 dark:border-red-500'
    : 'border-gray-300 dark:border-gray-700';

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {options ? (
        <select {...inputProps} className={`${baseClasses} ${errorClasses}`}>
          <option value="">Select an option</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <Component
          {...inputProps}
          placeholder={placeholder}
          className={`${baseClasses} ${errorClasses}`}
        />
      )}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
