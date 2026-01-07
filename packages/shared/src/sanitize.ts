export const SANITIZE = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 's', 'del', 'ins', 'mark',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code',
    'a', 'img',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'hr', 'div', 'span'
  ],
  ALLOWED_ATTR: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height'],
    '*': ['class', 'id']
  },
  ALLOWED_URI_SCHEMES: ['http', 'https', 'mailto', 'ftp'],
  ALLOWED_IMG_SCHEMES: ['http', 'https', 'data']
} as const;
