import { AppDataSource } from '../config/database';
import { Media, MediaType } from '../entities/Media';
import * as fs from 'fs/promises';
import * as path from 'path';
import sharp from 'sharp';
import { randomBytes } from 'crypto';

// Sanitize filename to prevent directory traversal
const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-z0-9.-]/gi, '_')
    .replace(/^\.+/, '')
    .slice(0, 255);
};

export class MediaService {
  private mediaRepository = AppDataSource.getRepository(Media);

  async uploadMedia(file: Express.Multer.File, entryId?: string) {
    const uploadDir = path.join(__dirname, '../../uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    // Generate secure filename with random bytes
    const sanitized = sanitizeFilename(file.originalname);
    const random = randomBytes(8).toString('hex');
    const filename = `${Date.now()}-${random}-${sanitized}`;
    const filepath = path.join(uploadDir, filename);
    const url = `/uploads/${filename}`;

    // Save file
    await fs.writeFile(filepath, file.buffer);

    let type = MediaType.DOCUMENT;
    let thumbnailUrl: string | null = null;
    let width: number | null = null;
    let height: number | null = null;

    if (file.mimetype.startsWith('image/')) {
      type = MediaType.IMAGE;

      // Generate thumbnail
      try {
        const thumbnailRandom = randomBytes(8).toString('hex');
        const thumbnailFilename = `thumb-${Date.now()}-${thumbnailRandom}-${sanitized}`;
        const thumbnailPath = path.join(uploadDir, thumbnailFilename);
        await sharp(filepath).resize(200, 200, { fit: 'cover' }).toFile(thumbnailPath);
        thumbnailUrl = `/uploads/${thumbnailFilename}`;

        // Get image dimensions
        const metadata = await sharp(filepath).metadata();
        width = metadata.width ?? null;
        height = metadata.height ?? null;
      } catch (error) {
        console.error('Error generating thumbnail:', error);
      }
    } else if (file.mimetype.startsWith('video/')) {
      type = MediaType.VIDEO;
    }

    const media = new Media();
    media.filename = filename;
    media.originalName = sanitized;
    media.mimetype = file.mimetype;
    media.type = type;
    media.size = file.size;
    media.url = url;
    media.thumbnailUrl = thumbnailUrl;
    media.width = width;
    media.height = height;
    if (entryId) {
      media.entryId = entryId;
    }

    return await this.mediaRepository.save(media);
  }

  async deleteMedia(id: string) {
    const media = await this.mediaRepository.findOne({ where: { id } });

    if (!media) {
      throw new Error('Media not found');
    }

    // Delete files
    const uploadDir = path.join(__dirname, '../../uploads');
    try {
      await fs.unlink(path.join(uploadDir, media.filename));
      if (media.thumbnailUrl) {
        const thumbFilename = media.thumbnailUrl.split('/').pop();
        if (thumbFilename) {
          await fs.unlink(path.join(uploadDir, thumbFilename));
        }
      }
    } catch (error) {
      console.error('Error deleting files:', error);
    }

    await this.mediaRepository.remove(media);
  }

  async getMedia(entryId: string) {
    return await this.mediaRepository.find({
      where: { entryId },
      order: { createdAt: 'DESC' },
    });
  }
}

export const mediaService = new MediaService();
