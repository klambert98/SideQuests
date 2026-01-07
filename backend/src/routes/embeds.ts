import { Router, Response } from 'express';
import { AuthRequest, authenticate } from '../middleware/authenticate';
import { embedService } from '../services/EmbedService';
import { EmbedType } from '../entities/Embed';
import { interactionLimiter } from '../middleware/rateLimiter';

export const embedRoutes = Router();

// Create embed
embedRoutes.post('/', interactionLimiter, authenticate, async (req: any, res: Response) => {
  try {
    const { url, type, entryId } = req.body;

    if (!url || !type) {
      return res.status(400).json({ error: 'URL and type required' });
    }

    const embed = await embedService.createEmbed(url, type as EmbedType, entryId);
    res.status(201).json(embed);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete embed
embedRoutes.delete('/:id', interactionLimiter, authenticate, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    await embedService.deleteEmbed(id);
    res.json({ message: 'Embed deleted' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
