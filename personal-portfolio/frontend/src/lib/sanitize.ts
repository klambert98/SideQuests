import DOMPurify from 'dompurify';

// Configure DOMPurify for safe HTML rendering
const sanitizeConfig = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 's', 'del', 'ins', 'mark',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code',
    'a', 'img',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'hr', 'div', 'span',
  ],
  ALLOWED_ATTR: [
    'href', 'title', 'target', 'rel',
    'src', 'alt', 'width', 'height',
    'class', 'id',
  ],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|ftp):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
  ALLOW_DATA_ATTR: false,
  ADD_ATTR: ['target'], // Allow target="_blank" for links
  ADD_URI_SAFE_ATTR: ['src'], // Allow src for images
};

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param dirty - Potentially unsafe HTML string
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHTML(dirty: string): string {
  if (typeof window === 'undefined') {
    // Server-side: return as-is (will be sanitized client-side)
    return dirty;
  }

  return DOMPurify.sanitize(dirty, sanitizeConfig);
}

/**
 * Sanitize and configure links to open in new tab with security
 * @param dirty - Potentially unsafe HTML string
 * @returns Sanitized HTML with secure external links
 */
export function sanitizeHTMLWithLinks(dirty: string): string {
  if (typeof window === 'undefined') {
    return dirty;
  }

  const clean = DOMPurify.sanitize(dirty, {
    ...sanitizeConfig,
    RETURN_DOM: true,
  }) as DocumentFragment;

  // Add rel="noopener noreferrer" to external links
  const links = clean.querySelectorAll('a[target="_blank"]');
  links.forEach((link: Element) => {
    link.setAttribute('rel', 'noopener noreferrer');
  });

  const div = document.createElement('div');
  div.appendChild(clean.cloneNode(true));
  return div.innerHTML;
}

/**
 * Strip all HTML tags and return plain text
 * @param dirty - HTML string
 * @returns Plain text with all HTML removed
 */
export function stripHTML(dirty: string): string {
  if (typeof window === 'undefined') {
    // Server-side: basic regex strip
    return dirty.replace(/<[^>]*>/g, '');
  }

  const clean = DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
  });

  return clean;
}

/**
 * Sanitize user input for display in attributes
 * @param input - User input string
 * @returns Escaped string safe for use in HTML attributes
 */
export function escapeHTML(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return input.replace(/[&<>"'/]/g, (char) => map[char]);
}
