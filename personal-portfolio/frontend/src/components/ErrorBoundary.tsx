'use client';

import { useEffect, useState } from 'react';

type ErrorBoundaryProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Uncaught error:', event.error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
        <h2 className="font-bold mb-2">Something went wrong</h2>
        <p className="text-sm">{fallback || 'An unexpected error occurred. Please try refreshing the page.'}</p>
        <button
          onClick={() => {
            setHasError(false);
            window.location.reload();
          }}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
        >
          Reload Page
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
