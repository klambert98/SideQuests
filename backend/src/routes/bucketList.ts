import { Router, Response } from 'express';
import { AuthRequest, authenticate } from '../middleware/authenticate';
import { bucketListItemService } from '../services/BucketListItemService';
import { CreateBucketListItemDto, UpdateBucketListItemDto, ReorderBucketListItemsDto } from '../dtos';
import { validateDto } from '../utils/validation';
import { AppError } from '../errors/AppError';
import { interactionLimiter } from '../middleware/rateLimiter';

export const bucketListRoutes = Router();

// Get all items (public - grouped by category)
bucketListRoutes.get('/', async (req, res: Response) => {
  try {
    const items = await bucketListItemService.getAllItems();
    res.json(items);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get statistics for bucket list
bucketListRoutes.get('/stats', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const stats = await bucketListItemService.getStatistics(req.userId!);
    res.json(stats);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Create a new bucket list item
bucketListRoutes.post('/', interactionLimiter, authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const dto = await validateDto(CreateBucketListItemDto, req.body);
    const item = await bucketListItemService.createItem(req.userId!, dto);
    res.status(201).json(item);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

// Update a bucket list item
bucketListRoutes.put('/:id', interactionLimiter, authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const dto = await validateDto(UpdateBucketListItemDto, req.body);
    const item = await bucketListItemService.updateItem(id, req.userId!, dto);
    res.json(item);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else if (error.message === 'Item not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

// Delete a bucket list item
bucketListRoutes.delete('/:id', interactionLimiter, authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await bucketListItemService.deleteItem(id, req.userId!);
    res.status(204).send();
  } catch (error: any) {
    if (error.message === 'Item not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

// Reorder bucket list items within a category
bucketListRoutes.post('/reorder', interactionLimiter, authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const dto = await validateDto(ReorderBucketListItemsDto, req.body);
    await bucketListItemService.reorderItems(req.userId!, dto.category, dto.itemIds);
    res.status(200).json({ message: 'Items reordered successfully' });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});
