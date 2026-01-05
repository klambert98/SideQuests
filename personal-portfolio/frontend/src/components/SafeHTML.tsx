'use client';

import { sanitizeHTML } from '@/lib/sanitize';

interface SafeHTMLProps {
  html: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Component for safely rendering user-generated HTML content
 * Automatically sanitizes HTML to prevent XSS attacks
 */
export default function SafeHTML({ html, className = '', as: Component = 'div' }: SafeHTMLProps) {
  const cleanHTML = sanitizeHTML(html);

  return (
    <Component
      className={className}
      dangerouslySetInnerHTML={{ __html: cleanHTML }}
    />
  );
}
