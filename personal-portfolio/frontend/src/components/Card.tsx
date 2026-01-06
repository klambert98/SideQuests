'use client';

import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'highlighted' | 'warning';
}

export function Card({ children, className = '', variant = 'default' }: CardProps) {
  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    highlighted: 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800',
    warning: 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800',
  };

  return (
    <div
      className={`rounded-lg shadow-md p-6 ${variantClasses[variant]} ${className}`}
    >
      {children}
    </div>
  );
}
