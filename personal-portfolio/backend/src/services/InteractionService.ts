import { AppDataSource } from '../config/database';
import { Like } from '../entities/Like';
import { Comment } from '../entities/Comment';
import { Entry } from '../entities/Entry';

export class InteractionService {
  private likeRepository = AppDataSource.getRepository(Like);
  private commentRepository = AppDataSource.getRepository(Comment);
  private entryRepository = AppDataSource.getRepository(Entry);

  async addLike(entryId: string, userId: string) {
    // Check if already liked
    const existing = await this.likeRepository.findOne({
      where: { entryId, userId },
    });

    if (existing) {
      throw new Error('Already liked this entry');
    }

    const like = new Like();
    like.entryId = entryId;
    like.userId = userId;

    await this.likeRepository.save(like);

    // Increment likes count on entry
    await this.entryRepository.increment({ id: entryId }, 'likes', 1);

    return like;
  }

  async removeLike(entryId: string, userId: string) {
    const like = await this.likeRepository.findOne({
      where: { entryId, userId },
    });

    if (!like) {
      throw new Error('Like not found');
    }

    await this.likeRepository.remove(like);

    // Decrement likes count on entry
    const entry = await this.entryRepository.findOne({ where: { id: entryId } });
    if (entry && entry.likes > 0) {
      entry.likes -= 1;
      await this.entryRepository.save(entry);
    }
  }

  async getLikes(entryId: string) {
    return await this.likeRepository.find({
      where: { entryId },
      relations: ['user'],
    });
  }

  async addComment(entryId: string, userId: string, text: string, name?: string) {
    if (!text.trim()) {
      throw new Error('Comment cannot be empty');
    }

    const comment = new Comment();
    comment.entryId = entryId;
    comment.userId = userId;
    comment.text = text;
    comment.name = name && name.trim() ? name.trim() : null;

    const savedComment = await this.commentRepository.save(comment);

    // Increment comments count on entry
    await this.entryRepository.increment({ id: entryId }, 'comments_count', 1);

    // Return comment with user data
    return await this.commentRepository.findOne({
      where: { id: savedComment.id },
      relations: ['user'],
    });
  }

  async getComments(entryId: string) {
    return await this.commentRepository.find({
      where: { entryId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  async deleteComment(commentId: string, entryId: string, userId: string) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    // Only allow comment creator or entry author to delete
    const entry = await this.entryRepository.findOne({ where: { id: entryId } });
    if (comment.userId !== userId && entry?.authorId !== userId) {
      throw new Error('Unauthorized: You can only delete your own comments');
    }

    await this.commentRepository.remove(comment);

    // Decrement comments count on entry
    await this.entryRepository.decrement({ id: entryId }, 'comments_count', 1);
  }
}

export const interactionService = new InteractionService();
