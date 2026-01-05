import { AppDataSource } from '../config/database';
import { Embed, EmbedType } from '../entities/Embed';
import axios from 'axios';

export class EmbedService {
  private embedRepository = AppDataSource.getRepository(Embed);

  async createEmbed(url: string, type: EmbedType, entryId?: string) {
    const embed = new Embed();
    embed.url = url;
    embed.type = type;

    // Extract metadata based on type
    try {
      const metadata = await this.extractMetadata(url, type);
      embed.embedCode = metadata.embedCode;
      embed.thumbnail = metadata.thumbnail;
      embed.title = metadata.title;
      embed.description = metadata.description;
      embed.metadata = metadata.metadata;
    } catch (error) {
      console.error('Error extracting metadata:', error);
    }

    if (entryId) {
      embed.entryId = entryId;
    }

    return await this.embedRepository.save(embed);
  }

  private async extractMetadata(url: string, type: EmbedType) {
    const metadata: any = {};

    switch (type) {
      case EmbedType.YOUTUBE: {
        const videoId = this.extractYoutubeId(url);
        if (videoId) {
          metadata.embedCode = `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
          metadata.thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
        break;
      }

      case EmbedType.INSTAGRAM: {
        const postId = this.extractInstagramId(url);
        if (postId) {
          metadata.embedCode = `<blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/${postId}/" data-instgrm-version="14"></blockquote><script async src="//www.instagram.com/embed.js"></script>`;
        }
        break;
      }

      case EmbedType.TWITTER: {
        const tweetId = this.extractTwitterId(url);
        if (tweetId) {
          metadata.embedCode = `<blockquote class="twitter-tweet"><a href="https://twitter.com/twitter/status/${tweetId}"></a></blockquote><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`;
        }
        break;
      }

      case EmbedType.VIMEO: {
        const videoId = this.extractVimeoId(url);
        if (videoId) {
          metadata.embedCode = `<iframe src="https://player.vimeo.com/video/${videoId}" width="100%" height="315" frameborder="0" allowfullscreen></iframe>`;
        }
        break;
      }

      case EmbedType.SPOTIFY: {
        const trackId = this.extractSpotifyId(url);
        if (trackId) {
          metadata.embedCode = `<iframe src="https://open.spotify.com/embed/track/${trackId}" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>`;
        }
        break;
      }

      case EmbedType.CUSTOM:
      default: {
        metadata.embedCode = `<a href="${url}" target="_blank">${url}</a>`;
        break;
      }
    }

    return metadata;
  }

  private extractYoutubeId(url: string): string | null {
    const patterns = [
      /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
      /youtu\.be\/([a-zA-Z0-9_-]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  private extractInstagramId(url: string): string | null {
    const match = url.match(/instagram\.com\/p\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  }

  private extractTwitterId(url: string): string | null {
    const match = url.match(/twitter\.com\/\w+\/status\/(\d+)/);
    return match ? match[1] : null;
  }

  private extractVimeoId(url: string): string | null {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : null;
  }

  private extractSpotifyId(url: string): string | null {
    const match = url.match(/spotify\.com\/track\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  }

  async deleteEmbed(id: string) {
    const embed = await this.embedRepository.findOne({ where: { id } });

    if (!embed) {
      throw new Error('Embed not found');
    }

    await this.embedRepository.remove(embed);
  }
}

export const embedService = new EmbedService();
