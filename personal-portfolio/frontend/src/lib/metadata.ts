import type { Metadata } from 'next';

type PageMetadataProps = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  tags?: string[];
};

const siteConfig = {
  name: 'My Side Quests',
  description: 'Documenting life adventures, one day at a time',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  ogImage: '/images/og-image.jpg',
  author: {
    name: 'Your Name',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  },
};

export function createMetadata({
  title,
  description,
  path = '',
  image,
  type = 'website',
  publishedTime,
  tags,
}: PageMetadataProps): Metadata {
  const url = `${siteConfig.url}${path}`;
  const ogImage = image || siteConfig.ogImage;

  return {
    title: `${title} | ${siteConfig.name}`,
    description,
    applicationName: siteConfig.name,
    authors: [{ name: siteConfig.author.name, url: siteConfig.author.url }],
    generator: 'Next.js',
    keywords: tags || ['portfolio', 'blog', 'timeline', 'personal website'],
    referrer: 'origin-when-cross-origin',
    creator: siteConfig.author.name,
    publisher: siteConfig.author.name,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: url,
    },
    openGraph: {
      type,
      siteName: siteConfig.name,
      title,
      description,
      url,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(type === 'article' && publishedTime
        ? {
            publishedTime,
          }
        : {}),
      ...(tags ? { tags } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      creator: '@yourusername',
    },
    metadataBase: new URL(siteConfig.url),
  };
}

// Home page metadata
export const homeMetadata = createMetadata({
  title: 'Home',
  description:
    'Welcome to my personal timeline. Explore my daily adventures, bucket list goals, and side quests.',
  path: '/',
});

// About page metadata
export const aboutMetadata = createMetadata({
  title: 'About',
  description:
    'Learn about my journey documenting daily life adventures and side quests. A digital scrapbook of moments that matter.',
  path: '/about',
});

// Bucket list metadata
export const bucketListMetadata = createMetadata({
  title: 'Bucket List',
  description:
    'My collection of life goals, adventures, and side quests. Track my progress as I check items off my bucket list.',
  path: '/bucket-list',
  tags: ['bucket list', 'goals', 'adventures', 'personal growth'],
});

// Dashboard metadata
export const dashboardMetadata = createMetadata({
  title: 'Dashboard',
  description: 'Manage your timeline entries and media.',
  path: '/dashboard',
});

// Login metadata
export const loginMetadata = createMetadata({
  title: 'Login',
  description: 'Login to manage your timeline and entries.',
  path: '/login',
});
