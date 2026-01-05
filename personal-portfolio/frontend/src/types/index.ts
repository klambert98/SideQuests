export type Entry = {
  id: string;
  title: string;
  content: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  entryDate: Date | string;
  summary?: string;
  tags: string[];
  views: number;
  likes: number;
  comments_count: number;
  media: Media[];
  embeds: Embed[];
  userLikes?: Like[];
  comments?: Comment[];
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type Like = {
  id: string;
  entryId: string;
  userId: string;
  createdAt: Date | string;
};

export type Comment = {
  id: string;
  entryId: string;
  userId: string;
  text: string;
  name?: string | null;
  author: User;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type Media = {
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  type: 'image' | 'video' | 'document';
  size: number;
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  description?: string;
  entryId?: string;
  createdAt: Date | string;
};

export type Embed = {
  id: string;
  type: 'instagram' | 'youtube' | 'twitter' | 'tiktok' | 'vimeo' | 'spotify' | 'custom';
  url: string;
  embedCode?: string;
  thumbnail?: string;
  title?: string;
  description?: string;
  metadata?: Record<string, any>;
  entryId?: string;
  createdAt: Date | string;
};

export type User = {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
};

export type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};
