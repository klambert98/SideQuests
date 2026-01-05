import sanitizeHtml from 'sanitize-html';

// Configuration for sanitizing user-generated content
const sanitizeConfig: sanitizeHtml.IOptions = {
  allowedTags: [
    'p', 'br', 'strong', 'em', 'u', 's', 'del', 'ins', 'mark',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code',
    'a', 'img',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'hr', 'div', 'span',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height'],
    '*': ['class', 'id'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'ftp'],
  allowedSchemesByTag: {
    img: ['http', 'https', 'data'],
  },
  transformTags: {
    // Add rel="noopener noreferrer" to external links
    a: (tagName, attribs) => {
      if (attribs.target === '_blank') {
        return {
          tagName,
          attribs: {
            ...attribs,
            rel: 'noopener noreferrer',
          },
        };
      }
      return { tagName, attribs };
    },
  },
};

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param dirty - Potentially unsafe HTML string
 * @returns Sanitized HTML string safe for storage and rendering
 */
export function sanitizeHTML(dirty: string): string {
  if (!dirty) return '';
  return sanitizeHtml(dirty, sanitizeConfig);
}

/**
 * Strip all HTML tags and return plain text
 * @param dirty - HTML string
 * @returns Plain text with all HTML removed
 */
export function stripHTML(dirty: string): string {
  if (!dirty) return '';
  return sanitizeHtml(dirty, {
    allowedTags: [],
    allowedAttributes: {},
  });
}

/**
 * Sanitize text for use in HTML attributes
 * @param input - User input string
 * @returns Escaped string safe for use in HTML attributes
 */
export function escapeHTML(input: string): string {
  if (!input) return '';
  
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

/**
 * Sanitize an array of strings (e.g., tags)
 * @param items - Array of strings to sanitize
 * @returns Array of sanitized strings with HTML stripped
 */
export function sanitizeArray(items: string[]): string[] {
  if (!Array.isArray(items)) return [];
  return items.map((item) => stripHTML(item).trim()).filter(Boolean);
}
