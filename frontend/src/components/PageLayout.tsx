'use client';

import { Navigation } from './Navigation';
import { Footer } from './Footer';

type PageLayoutProps = {
  children: React.ReactNode;
  showNavigation?: boolean;
  showFooter?: boolean;
  className?: string;
  gradientFrom?: string;
  gradientTo?: string;
};

export function PageLayout({
  children,
  showNavigation = true,
  showFooter = true,
  className = '',
  gradientFrom = 'from-slate-50',
  gradientTo = 'to-indigo-50',
}: PageLayoutProps) {
  return (
    <div
      className={`min-h-screen bg-gradient-to-b ${gradientFrom} via-white ${gradientTo} dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 ${className}`}
    >
      {showNavigation && <Navigation />}
      <div className={showNavigation ? 'pt-20' : ''}>
        {children}
      </div>
      {showFooter && <Footer />}
    </div>
  );
}
