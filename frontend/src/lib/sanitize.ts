import DOMPurify from 'dompurify';
import { SANITIZE } from '@portfolio/shared/sanitize';

// Configure DOMPurify based on shared allowlists
const sanitizeDomPurifyConfig = {
  ALLOWED_TAGS: [...SANITIZE.ALLOWED_TAGS],
  ALLOWED_ATTR: [
    ...SANITIZE.ALLOWED_ATTR.a,
    ...SANITIZE.ALLOWED_ATTR.img,
    ...SANITIZE.ALLOWED_ATTR['*'],
  ],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|ftp):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
  ALLOW_DATA_ATTR: false,
  ADD_ATTR: ['target'],
  ADD_URI_SAFE_ATTR: ['src'],
};

export function sanitizeHTML(dirty: string): string {
  if (typeof window === 'undefined') {
    return dirty;
  }
  return DOMPurify.sanitize(dirty, sanitizeDomPurifyConfig);
}

export function sanitizeHTMLWithLinks(dirty: string): string {
  if (typeof window === 'undefined') {
    return dirty;
  }
  const clean = DOMPurify.sanitize(dirty, {
    ...sanitizeDomPurifyConfig,
    RETURN_DOM: true,
  }) as DocumentFragment;
  const links = clean.querySelectorAll('a[target="_blank"]');
  links.forEach((link: Element) => {
    link.setAttribute('rel', 'noopener noreferrer');
  });
  const div = document.createElement('div');
  div.appendChild(clean.cloneNode(true));
  return div.innerHTML;
}

export function stripHTML(dirty: string): string {
  if (typeof window === 'undefined') {
    return dirty.replace(/<[^>]*>/g, '');
  }
  const clean = DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
  });
  return clean;
}

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
