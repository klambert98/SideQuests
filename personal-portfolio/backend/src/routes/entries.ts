import { Router, Response } from 'express';
import { AuthRequest, authenticate } from '../middleware/authenticate';
import { entryService } from '../services/EntryService';
import { interactionService } from '../services/InteractionService';
import { CreateEntryDto, UpdateEntryDto } from '../dtos';
import { validateDto } from '../utils/validation';

export const entryRoutes = Router();

// Get timeline (organized by month)
entryRoutes.get('/timeline', async (req: any, res: Response) => {
  try {
    const timeline = await entryService.getTimeline();
    res.json(timeline);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get entries by month
entryRoutes.get('/month/:year/:month', async (req: any, res: Response) => {
  try {
    const { year, month } = req.params;
    const entries = await entryService.getEntriesByMonth(parseInt(year), parseInt(month));
    res.json(entries);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get all entries (paginated)
entryRoutes.get('/', async (req: any, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = (req.query.status as string) || 'published';

    const result = await entryService.getEntries(page, limit, status);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Search entries
entryRoutes.get('/search/:query', async (req: any, res: Response) => {
  try {
    const { query } = req.params;
    const entries = await entryService.searchEntries(query);
    res.json(entries);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================
// Routes with /:id/... - MUST come before /:id
// ============================================

// Like entry
entryRoutes.post('/:id/like', authenticate, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    await interactionService.addLike(id, req.userId!);
    res.status(201).json({ message: 'Entry liked' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Unlike entry
entryRoutes.delete('/:id/like', authenticate, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    await interactionService.removeLike(id, req.userId!);
    res.json({ message: 'Like removed' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get likes for entry
entryRoutes.get('/:id/likes', async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const likes = await interactionService.getLikes(id);
    res.json(likes);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Add comment to entry
entryRoutes.post('/:id/comments', authenticate, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { text, name } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const comment = await interactionService.addComment(id, req.userId!, text, name);
    res.status(201).json(comment);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get comments for entry
entryRoutes.get('/:id/comments', async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const comments = await interactionService.getComments(id);
    res.json(comments);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete comment
entryRoutes.delete('/:id/comments/:commentId', authenticate, async (req: any, res: Response) => {
  try {
    const { id, commentId } = req.params;
    await interactionService.deleteComment(commentId, id, req.userId!);
    res.json({ message: 'Comment deleted' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================
// Routes with /:id - MUST come after /:id/...
// ============================================

// Get single entry
entryRoutes.get('/:id', async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const entry = await entryService.getEntry(id);
    res.json(entry);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

// Create entry
entryRoutes.post('/', authenticate, async (req: any, res: Response) => {
  try {
    const validatedData = await validateDto(CreateEntryDto, req.body);

    const entry = await entryService.createEntry(
      {
        title: validatedData.title,
        content: validatedData.content,
        entryDate: validatedData.entryDate ? new Date(validatedData.entryDate) : new Date(),
        status: validatedData.status as 'draft' | 'published' | 'archived' | undefined,
        summary: validatedData.summary,
        tags: validatedData.tags || [],
      },
      req.userId!
    );

    res.status(201).json(entry);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update entry
entryRoutes.put('/:id', authenticate, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = await validateDto(UpdateEntryDto, req.body);

    const entry = await entryService.updateEntry(
      id,
      {
        title: validatedData.title,
        content: validatedData.content,
        status: validatedData.status as 'draft' | 'published' | 'archived' | undefined,
        summary: validatedData.summary,
        tags: validatedData.tags,
      },
      req.userId!
    );

    res.json(entry);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete entry
entryRoutes.delete('/:id', authenticate, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    await entryService.deleteEntry(id, req.userId!);
    res.json({ message: 'Entry deleted' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});