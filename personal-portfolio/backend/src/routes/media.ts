import { Router, Response } from 'express';
import { AuthRequest, authenticate } from '../middleware/authenticate';
import { mediaService } from '../services/MediaService';
import multer from 'multer';

// Configure multer with security limits
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
  fileFilter: (req, file, cb) => {
    // Allowed MIME types
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/webm',
      'video/quicktime',
    ];

    if (!allowedMimes.includes(file.mimetype)) {
      cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: ${allowedMimes.join(', ')}`));
    } else {
      cb(null, true);
    }
  },
});

export const mediaRoutes = Router();

// Upload media
mediaRoutes.post('/upload', authenticate, upload.single('file'), async (req: any, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const entryId = req.body.entryId || undefined;
    const media = await mediaService.uploadMedia(req.file, entryId);

    res.status(201).json(media);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get media for entry
mediaRoutes.get('/entry/:entryId', async (req: any, res: Response) => {
  try {
    const { entryId } = req.params;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(entryId)) {
      return res.status(400).json({ error: 'Invalid entry ID' });
    }

    const media = await mediaService.getMedia(entryId);
    res.json(media);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete media
mediaRoutes.delete('/:id', authenticate, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ error: 'Invalid media ID' });
    }

    await mediaService.deleteMedia(id);
    res.json({ message: 'Media deleted' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
