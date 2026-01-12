import '@/styles/globals.css';
import type { Metadata, Viewport } from 'next';
import { homeMetadata } from '@/lib/metadata';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastProvider } from '@/contexts/ToastContext';
import { ToastContainer } from '@/components/Toast';
import { HealthCheckProvider } from '@/components/HealthCheckProvider';

export const metadata: Metadata = {
  ...homeMetadata,
  title: 'My Side Quests',
  description: 'Personal life portfolio - Daily entries, travels, and moments that matter',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <ToastProvider>
          <ErrorBoundary>
            <HealthCheckProvider>
              {children}
            </HealthCheckProvider>
          </ErrorBoundary>
          <ToastContainer />
        </ToastProvider>
      </body>
    </html>
  );
}
