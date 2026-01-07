import { AppDataSource } from '../config/database';
import { BucketListItem } from '../entities/BucketListItem';
import { CreateBucketListItemDto, UpdateBucketListItemDto } from '../dtos';

export class BucketListItemService {
  private bucketListRepository = AppDataSource.getRepository(BucketListItem);

  async createItem(userId: string, data: CreateBucketListItemDto): Promise<BucketListItem> {
    // Get the max displayOrder in this category
    const maxOrderItem = await this.bucketListRepository.findOne({
      where: { userId, category: data.category },
      order: { displayOrder: 'DESC' },
    });

    const item = this.bucketListRepository.create({
      userId,
      title: data.title,
      description: data.description,
      category: data.category,
      subcategory: data.subcategory,
      completed: data.completed || false,
      timelineEntryId: data.timelineEntryId,
      parentId: data.parentId,
      displayOrder: maxOrderItem ? maxOrderItem.displayOrder + 1 : 0,
    });

    return await this.bucketListRepository.save(item);
  }

  async getItemsByUser(userId: string): Promise<Record<string, BucketListItem[]>> {
    const items = await this.bucketListRepository.find({
      where: { userId },
      order: { category: 'ASC', displayOrder: 'ASC', createdAt: 'ASC' },
    });

    // Group items by category
    const grouped = items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, BucketListItem[]>);

    return grouped;
  }

  async getAllItems(): Promise<Record<string, BucketListItem[]>> {
    // Get all bucket list items (for public viewing)
    const items = await this.bucketListRepository.find({
      relations: ['children'],
      order: { category: 'ASC', completed: 'DESC', displayOrder: 'ASC', createdAt: 'ASC' },
    });

    // Filter to only top-level items (those without a parent)
    const topLevelItems = items.filter(item => !item.parentId);

    // Sort children within each parent (completed first)
    topLevelItems.forEach(item => {
      if (item.children && item.children.length > 0) {
        item.children.sort((a, b) => {
          // Completed items first
          if (a.completed !== b.completed) {
            return a.completed ? -1 : 1;
          }
          // Then by displayOrder
          return a.displayOrder - b.displayOrder;
        });
      }
    });

    // Group items by category
    const grouped = topLevelItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, BucketListItem[]>);

    return grouped;
  }

  async getItem(itemId: string, userId: string): Promise<BucketListItem | null> {
    return await this.bucketListRepository.findOne({
      where: { id: itemId, userId },
      relations: ['children'],
    });
  }

  async updateItem(itemId: string, userId: string, data: UpdateBucketListItemDto): Promise<BucketListItem> {
    const item = await this.getItem(itemId, userId);
    if (!item) {
      throw new Error('Item not found');
    }

    if (data.title !== undefined) item.title = data.title;
    if (data.description !== undefined) item.description = data.description;
    if (data.category !== undefined) item.category = data.category;
    if (data.subcategory !== undefined) item.subcategory = data.subcategory;
    if (data.completed !== undefined) item.completed = data.completed;
    if (data.timelineEntryId !== undefined) item.timelineEntryId = data.timelineEntryId;
    if (data.parentId !== undefined) item.parentId = data.parentId;

    return await this.bucketListRepository.save(item);
  }

  async deleteItem(itemId: string, userId: string): Promise<void> {
    const result = await this.bucketListRepository.delete({
      id: itemId,
      userId,
    });

    if (result.affected === 0) {
      throw new Error('Item not found');
    }
  }

  async bulkCreateItems(userId: string, items: CreateBucketListItemDto[]): Promise<BucketListItem[]> {
    const itemEntities = items.map((item) =>
      this.bucketListRepository.create({
        userId,
        title: item.title,
        description: item.description,
        category: item.category,
        completed: item.completed || false,
        timelineEntryId: item.timelineEntryId,
      })
    );

    return await this.bucketListRepository.save(itemEntities);
  }

  async getStatistics(userId: string) {
    const items = await this.bucketListRepository.find({
      where: { userId },
    });

    const total = items.length;
    const completed = items.filter((item) => item.completed).length;
    const byCategory = items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = { total: 0, completed: 0 };
      }
      acc[item.category].total++;
      if (item.completed) {
        acc[item.category].completed++;
      }
      return acc;
    }, {} as Record<string, { total: number; completed: number }>);

    return {
      total,
      completed,
      percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
      byCategory,
    };
  }

  async reorderItems(userId: string, category: string, itemIds: string[]): Promise<void> {
    // Verify all items belong to the user and category
    const items = await this.bucketListRepository.find({
      where: { userId, category },
    });

    const itemMap = new Map(items.map(item => [item.id, item]));
    
    // Validate that all provided IDs exist and belong to this category
    for (const id of itemIds) {
      if (!itemMap.has(id)) {
        throw new Error(`Item ${id} not found in category ${category}`);
      }
    }

    // Update display order for each item
    const updates = itemIds.map((id, index) => {
      const item = itemMap.get(id)!;
      item.displayOrder = index;
      return item;
    });

    await this.bucketListRepository.save(updates);
  }
}

export const bucketListItemService = new BucketListItemService();
