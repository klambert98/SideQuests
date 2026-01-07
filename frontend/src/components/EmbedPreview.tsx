'use client';

import { getMediaUrl } from '@/lib/api';

type EmbedPreviewProps = {
  embed: {
    id: string;
    url: string;
    type?: string;
    title?: string;
    description?: string;
    thumbnail?: string;
    embedCode?: string;
  };
};

// Sanitize embedCode to allow only trusted embed sources
function sanitizeEmbedCode(code: string): string {
  // Only allow iframes from trusted sources
  const trustedDomains = ['youtube.com', 'youtu.be', 'instagram.com', 'twitter.com', 'x.com', 'vimeo.com', 'spotify.com', 'tiktok.com'];
  
  // Check if iframe src is from trusted domain
  const iframeRegex = /<iframe[^>]*src=[\"']([^\"']*)[\"'][^>]*>[^<]*<\/iframe>/gi;
  let sanitized = code;
  
  let match;
  while ((match = iframeRegex.exec(code)) !== null) {
    const src = match[1];
    try {
      const isTrusted = trustedDomains.some(domain => new URL(src, 'https://example.com').hostname?.includes(domain));
      if (!isTrusted) {
        // Replace untrusted iframe with safe link
        sanitized = sanitized.replace(match[0], `<a href="${src}" target="_blank" rel="noopener noreferrer">Open embedded content</a>`);
      }
    } catch (e) {
      // Invalid URL, replace with safe link
      sanitized = sanitized.replace(match[0], `<a target="_blank" rel="noopener noreferrer">Invalid embed</a>`);
    }
  }
  
  return sanitized;
}

export function EmbedPreview({ embed }: EmbedPreviewProps) {
  // If embed code exists (YouTube, Instagram, Twitter, Vimeo, Spotify, etc.), render it
  if (embed.embedCode) {
    // Check if it's a rich embed (iframe or script-based)
    if (embed.embedCode.includes('<iframe') || embed.embedCode.includes('<blockquote')) {
      const sanitizedCode = sanitizeEmbedCode(embed.embedCode);
      return (
        <div className="my-6 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div
            dangerouslySetInnerHTML={{ __html: sanitizedCode }}
            className="w-full flex justify-center"
          />
        </div>
      );
    }
  }

  // Fallback to card preview for custom links
  return (
    <div className="my-6 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* Thumbnail */}
      {embed.thumbnail && (
        <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
          <img
            src={getMediaUrl(embed.thumbnail)}
            alt={embed.title || 'Embed preview'}
            className="w-full h-full object-cover"
            onError={(e) => {
              // If image fails to load, hide it
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Content */}
      <a
        href={embed.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
      >
        {embed.title && (
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {embed.title}
          </h3>
        )}

        {embed.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {embed.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-500 truncate">
            {new URL(embed.url).hostname}
          </span>
          <span className="ml-2 text-indigo-600 dark:text-indigo-400 text-sm font-medium">
            Open →
          </span>
        </div>
      </a>
    </div>
  );
}
