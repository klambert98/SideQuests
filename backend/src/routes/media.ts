import { Router, Response } from 'express';
import { AuthRequest, authenticate } from '../middleware/authenticate';
import { mediaService } from '../services/MediaService';
import multer from 'multer';
import path from 'path';
import * as fs from 'fs/promises';
import { interactionLimiter } from '../middleware/rateLimiter';

// Configure multer with disk storage to avoid large in-memory buffers
const uploadDir = path.join(__dirname, '../../uploads');
const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (err: any) {
      cb(err, uploadDir);
    }
  },
  filename: (_req, file, cb) => {
    // Keep original name sanitized and prefix with timestamp to avoid collisions
    const base = file.originalname.replace(/[^a-z0-9.-]/gi, '_');
    const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    cb(null, `${unique}-${base}`);
  },
});

const upload = multer({
  storage,
  limits: {
    // Allow larger uploads; disk storage avoids memory pressure
    fileSize: 200 * 1024 * 1024, // 200MB max
  },
  fileFilter: (_req, file, cb) => {
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
mediaRoutes.post('/upload', interactionLimiter, authenticate, upload.single('file'), async (req: any, res: Response) => {
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
mediaRoutes.delete('/:id', interactionLimiter, authenticate, async (req: any, res: Response) => {
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
