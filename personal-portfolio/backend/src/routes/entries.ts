import { Router, Response } from 'express';
import { AuthRequest, authenticate } from '../middleware/authenticate';
import { entryService } from '../services/EntryService';
import { interactionService } from '../services/InteractionService';
import { CreateEntryDto, UpdateEntryDto } from '../dtos';
import { validateDto } from '../utils/validation';
import { likeLimiter, commentLimiter, interactionLimiter } from '../middleware/rateLimiter';

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
entryRoutes.post('/:id/like', likeLimiter, authenticate, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    await interactionService.addLike(id, req.userId!);
    res.status(201).json({ message: 'Entry liked' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Unlike entry
entryRoutes.delete('/:id/like', likeLimiter, authenticate, async (req: any, res: Response) => {
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

// Add comment to entry (anonymous or authenticated)
entryRoutes.post('/:id/comments', commentLimiter, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { text, name, sessionToken } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    // Check if user is authenticated via Authorization header
    const token = req.headers.authorization?.split(' ')[1];
    let userId: string | null = null;
    
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string };
        userId = decoded.userId;
      } catch (error) {
        // Invalid token, treat as anonymous
        userId = null;
      }
    }

    const comment = await interactionService.addComment(id, userId, text, name, sessionToken);
    res.status(201).json(comment);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get comments for entry
entryRoutes.get('/:id/comments', async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const sessionToken = req.query.sessionToken as string | undefined;
    
    // Check if user is authenticated
    const token = req.headers.authorization?.split(' ')[1];
    let userId: string | undefined;
    
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string };
        userId = decoded.userId;
      } catch (error) {
        // Invalid token, ignore
        userId = undefined;
      }
    }
    
    const comments = await interactionService.getComments(id, userId, sessionToken);
    res.json(comments);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete comment (authenticated or anonymous with session token)
entryRoutes.delete('/:id/comments/:commentId', interactionLimiter, async (req: any, res: Response) => {
  try {
    const { id, commentId } = req.params;
    const { sessionToken } = req.body;
    
    // Check if user is authenticated
    const token = req.headers.authorization?.split(' ')[1];
    let userId: string | undefined;
    
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string };
        userId = decoded.userId;
      } catch (error) {
        // Invalid token
        userId = undefined;
      }
    }
    
    await interactionService.deleteComment(commentId, id, userId, sessionToken);
    res.json({ message: 'Comment deleted' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Flag comment (for users to report inappropriate content)
entryRoutes.post('/:id/comments/:commentId/flag', authenticate, async (req: any, res: Response) => {
  try {
    const { commentId } = req.params;
    const { reason } = req.body;
    const comment = await interactionService.flagComment(commentId, req.userId!, reason);
    res.json({ message: 'Comment flagged for moderation', comment });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Moderate comment (admin only)
entryRoutes.post('/:id/comments/:commentId/moderate', authenticate, async (req: any, res: Response) => {
  try {
    const { commentId } = req.params;
    const { status, reason } = req.body;

    if (!['approved', 'rejected', 'flagged'].includes(status)) {
      return res.status(400).json({ error: 'Invalid moderation status' });
    }

    const comment = await interactionService.moderateComment(commentId, req.userId!, status, reason);
    res.json({ message: 'Comment moderated', comment });
  } catch (error: any) {
    const statusCode = error.statusCode || 400;
    res.status(statusCode).json({ error: error.message });
  }
});

// Get pending comments (admin only)
entryRoutes.get('/moderation/pending', authenticate, async (req: any, res: Response) => {
  try {
    const comments = await interactionService.getPendingComments(req.userId!);
    res.json(comments);
  } catch (error: any) {
    const statusCode = error.statusCode || 400;
    res.status(statusCode).json({ error: error.message });
  }
});

// Get flagged comments (admin only)
entryRoutes.get('/moderation/flagged', authenticate, async (req: any, res: Response) => {
  try {
    const comments = await interactionService.getFlaggedComments(req.userId!);
    res.json(comments);
  } catch (error: any) {
    const statusCode = error.statusCode || 400;
    res.status(statusCode).json({ error: error.message });
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