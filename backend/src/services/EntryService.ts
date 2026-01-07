import { AppDataSource } from '../config/database';
import { Entry } from '../entities/Entry';
import { MoreThan, LessThan, Between } from 'typeorm';
import { sanitizeHTML, sanitizeArray, stripHTML } from '../utils/sanitize';

export class EntryService {
  private entryRepository = AppDataSource.getRepository(Entry);

  private generateSlug(title: string): string {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  private async ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.entryRepository.findOne({ 
        where: { slug },
        select: ['id']
      });

      if (!existing || (excludeId && existing.id === excludeId)) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  async createEntry(data: Partial<Entry>, userId: string) {
    const entry = new Entry();
    entry.title = stripHTML(data.title!); // Strip HTML from title
    entry.content = sanitizeHTML(data.content!); // Sanitize content HTML
    
    const baseSlug = this.generateSlug(data.title!);
    entry.slug = await this.ensureUniqueSlug(baseSlug);
    
    entry.entryDate = data.entryDate || new Date();
    entry.status = data.status || 'draft';
    entry.summary = data.summary ? stripHTML(data.summary) : ''; // Strip HTML from summary
    entry.tags = data.tags ? sanitizeArray(data.tags) : []; // Sanitize tags array
    entry.authorId = userId;

    return await this.entryRepository.save(entry);
  }

  async getEntries(page: number = 1, limit: number = 10, status: string = 'published') {
    const skip = (page - 1) * limit;

    const [entries, total] = await this.entryRepository.findAndCount({
      where: { status: status as any },
      order: { entryDate: 'DESC' },
      skip,
      take: limit,
      relations: ['media', 'embeds'],
    });

    return {
      data: entries,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async getEntriesByMonth(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return await this.entryRepository.find({
      where: {
        entryDate: Between(startDate, endDate),
        status: 'published',
      },
      order: { entryDate: 'DESC' },
      relations: ['media', 'embeds'],
    });
  }

  async getTimeline() {
    // Get entries grouped by year and month
    const entries = await this.entryRepository.find({
      where: { status: 'published' },
      order: { entryDate: 'DESC' },
      relations: ['media', 'embeds'],
    });

    const timeline: Record<string, Record<string, any[]>> = {};

    entries.forEach((entry) => {
      // entryDate is stored as a date column, which TypeORM returns as a string; normalize to Date
      const entryDate = entry.entryDate instanceof Date ? entry.entryDate : new Date(entry.entryDate);
      if (Number.isNaN(entryDate.getTime())) {
        return; // skip malformed dates instead of crashing the timeline
      }

      const year = entryDate.getFullYear().toString();
      const month = (entryDate.getMonth() + 1).toString().padStart(2, '0');

      if (!timeline[year]) {
        timeline[year] = {};
      }

      if (!timeline[year][month]) {
        timeline[year][month] = [];
      }

      timeline[year][month].push(entry);
    });

    return timeline;
  }

  async getEntry(id: string) {
    const entry = await this.entryRepository.findOne({
      where: { id },
      relations: ['media', 'embeds', 'userLikes'],
    });

    if (!entry) {
      throw new Error('Entry not found');
    }

    // Increment view count
    entry.views += 1;
    await this.entryRepository.save(entry);

    return entry;
  }

  async updateEntry(id: string, data: Partial<Entry>, userId: string) {
    const entry = await this.entryRepository.findOne({ where: { id } });

    if (!entry) {
      throw new Error('Entry not found');
    }

    if (entry.authorId !== userId) {
      throw new Error('Unauthorized');
    }

    // Sanitize updated fields
    if (data.title) {
      entry.title = stripHTML(data.title);
      const baseSlug = this.generateSlug(data.title);
      entry.slug = await this.ensureUniqueSlug(baseSlug, entry.id);
    }
    if (data.content) {
      entry.content = sanitizeHTML(data.content);
    }
    if (data.summary) {
      entry.summary = stripHTML(data.summary);
    }
    if (data.tags) {
      entry.tags = sanitizeArray(data.tags);
    }
    
    // Update other safe fields
    if (data.status) entry.status = data.status;
    if (data.entryDate) entry.entryDate = data.entryDate;

    return await this.entryRepository.save(entry);
  }

  async deleteEntry(id: string, userId: string) {
    const entry = await this.entryRepository.findOne({ where: { id } });

    if (!entry) {
      throw new Error('Entry not found');
    }

    if (entry.authorId !== userId) {
      throw new Error('Unauthorized');
    }

    await this.entryRepository.remove(entry);
  }

  async searchEntries(query: string) {
    return await this.entryRepository
      .createQueryBuilder('entry')
      .where('entry.title ILIKE :query', { query: `%${query}%` })
      .orWhere('entry.content ILIKE :query', { query: `%${query}%` })
      .andWhere('entry.status = :status', { status: 'published' })
      .orderBy('entry.entryDate', 'DESC')
      .leftJoinAndSelect('entry.media', 'media')
      .leftJoinAndSelect('entry.embeds', 'embeds')
      .getMany();
  }
}

export const entryService = new EntryService();
