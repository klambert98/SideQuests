import sanitizeHtml from 'sanitize-html';
import { SANITIZE } from '@portfolio/shared';

const sanitizeConfig: sanitizeHtml.IOptions = {
  allowedTags: [...SANITIZE.ALLOWED_TAGS],
  allowedAttributes: {
    a: [...SANITIZE.ALLOWED_ATTR.a],
    img: [...SANITIZE.ALLOWED_ATTR.img],
    '*': [...SANITIZE.ALLOWED_ATTR['*']],
  },
  allowedSchemes: [...SANITIZE.ALLOWED_URI_SCHEMES],
  allowedSchemesByTag: {
    img: [...SANITIZE.ALLOWED_IMG_SCHEMES],
  },
  transformTags: {
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

export function sanitizeHTML(dirty: string): string {
  if (!dirty) return '';
  return sanitizeHtml(dirty, sanitizeConfig);
}

export function stripHTML(dirty: string): string {
  if (!dirty) return '';
  return sanitizeHtml(dirty, {
    allowedTags: [],
    allowedAttributes: {},
  });
}

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

export function sanitizeArray(items: string[]): string[] {
  if (!Array.isArray(items)) return [];
  return items.map((item) => stripHTML(item).trim()).filter(Boolean);
}
