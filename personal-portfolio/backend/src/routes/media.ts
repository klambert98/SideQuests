import { Router, Response } from 'express';
import { AuthRequest, authenticate } from '../middleware/authenticate';
import { mediaService } from '../services/MediaService';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

export const mediaRoutes = Router();

// Upload media
mediaRoutes.post('/upload', authenticate, upload.single('file'), async (req: AuthRequest, res: Response) => {
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
mediaRoutes.get('/entry/:entryId', async (req: AuthRequest, res: Response) => {
  try {
    const { entryId } = req.params;
    const media = await mediaService.getMedia(entryId);
    res.json(media);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete media
mediaRoutes.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await mediaService.deleteMedia(id);
    res.json({ message: 'Media deleted' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
