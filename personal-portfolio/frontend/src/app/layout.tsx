import '@/styles/globals.css';
import type { Metadata } from 'next';
import { homeMetadata } from '@/lib/metadata';

export const metadata: Metadata = {
  ...homeMetadata,
  title: 'My Side Quests',
  description: 'Personal life portfolio - Daily entries, travels, and moments that matter',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
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
        {children}
      </body>
    </html>
  );
}
