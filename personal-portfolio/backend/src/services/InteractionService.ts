import { AppDataSource } from '../config/database';
import { Like } from '../entities/Like';
import { Comment } from '../entities/Comment';
import { Entry } from '../entities/Entry';
import { User } from '../entities/User';
import { emailService } from './EmailService';
import { logger } from './LoggerService';
import { VALIDATION_LIMITS, VALIDATION_MESSAGES } from '../constants/validation';
import { AppError, UnauthorizedError, NotFoundError, ValidationError } from '../errors/AppError';

export class InteractionService {
  private likeRepository = AppDataSource.getRepository(Like);
  private commentRepository = AppDataSource.getRepository(Comment);
  private entryRepository = AppDataSource.getRepository(Entry);
  private userRepository = AppDataSource.getRepository(User);

  async addLike(entryId: string, userId: string) {
    // Check if already liked
    const existing = await this.likeRepository.findOne({
      where: { entryId, userId },
    });

    if (existing) {
      throw new AppError(409, 'Already liked this entry');
    }

    const like = new Like();
    like.entryId = entryId;
    like.userId = userId;

    await this.likeRepository.save(like);

    // Increment likes count on entry
    await this.entryRepository.increment({ id: entryId }, 'likes', 1);

    // Send email notification to entry author
    try {
      const entry = await this.entryRepository.findOne({ 
        where: { id: entryId },
        relations: ['author']
      });
      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (entry && entry.author && user && entry.authorId !== userId) {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const entryUrl = `${siteUrl}/entries/${entryId}`;
        
        await emailService.sendLikeNotification(
          entry.author.email,
          entry.title,
          user.name || user.email,
          entryUrl
        );
      }
    } catch (error) {
      logger.error('Failed to send like notification email', error);
      // Don't fail the like operation if email fails
    }

    return like;
  }

  async removeLike(entryId: string, userId: string) {
    const like = await this.likeRepository.findOne({
      where: { entryId, userId },
    });

    if (!like) {
      throw new NotFoundError('Like');
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
      throw new ValidationError(VALIDATION_MESSAGES.COMMENT_EMPTY);
    }
    
    if (text.length > VALIDATION_LIMITS.COMMENT_TEXT_MAX) {
      throw new ValidationError(VALIDATION_MESSAGES.COMMENT_TOO_LONG);
    }
    
    if (name && name.length > VALIDATION_LIMITS.COMMENT_NAME_MAX) {
      throw new ValidationError(VALIDATION_MESSAGES.COMMENT_NAME_TOO_LONG);
    }

    const comment = new Comment();
    comment.entryId = entryId;
    comment.userId = userId;
    comment.text = text;
    comment.name = name && name.trim() ? name.trim() : null;

    const savedComment = await this.commentRepository.save(comment);

    // Increment comments count on entry
    await this.entryRepository.increment({ id: entryId }, 'comments_count', 1);

    // Send moderation notification for pending comment
    try {
      const entry = await this.entryRepository.findOne({ 
        where: { id: entryId },
        relations: ['author']
      });
      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (entry && savedComment.moderationStatus === 'pending') {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const moderationUrl = `${siteUrl}/dashboard/moderation`;
        const adminEmail = process.env.ADMIN_EMAIL;
        
        if (adminEmail) {
          await emailService.sendModerationNotification(
            adminEmail,
            {
              commentText: text,
              commentId: savedComment.id,
              entryTitle: entry.title,
              moderationUrl
            }
          );
        }
      }
    } catch (error) {
      logger.error('Failed to send moderation notification email', error);
      // Don't fail the comment operation if email fails
    }

    // Return comment with user data
    return await this.commentRepository.findOne({
      where: { id: savedComment.id },
      relations: ['user'],
    });
  }

  async getComments(entryId: string, userId?: string) {
    // If userId provided, include their pending comments too
    if (userId) {
      return await this.commentRepository.find({
        where: [
          { entryId, moderationStatus: 'approved' },
          { entryId, userId, moderationStatus: 'pending' }
        ],
        relations: ['user'],
        order: { createdAt: 'ASC' },
      });
    }
    
    // Public view - only approved comments
    return await this.commentRepository.find({
      where: { 
        entryId,
        moderationStatus: 'approved'
      },
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

  async moderateComment(commentId: string, moderatorId: string, status: 'approved' | 'rejected' | 'flagged', reason?: string) {
    // Verify moderator is an admin
    const moderator = await this.userRepository.findOne({ where: { id: moderatorId } });
    if (!moderator || moderator.role !== 'admin') {
      throw new UnauthorizedError(VALIDATION_MESSAGES.ADMIN_ONLY);
    }
    
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundError('Comment');
    }

    comment.moderationStatus = status;
    comment.moderationReason = reason || null;
    comment.moderatedBy = moderatorId;
    comment.moderatedAt = new Date();

    await this.commentRepository.save(comment);
    return comment;
  }

  async getPendingComments(requestingUserId: string) {
    // Verify user is an admin
    const user = await this.userRepository.findOne({ where: { id: requestingUserId } });
    if (!user || user.role !== 'admin') {
      throw new UnauthorizedError(VALIDATION_MESSAGES.ADMIN_ONLY);
    }
    
    return await this.commentRepository.find({
      where: { moderationStatus: 'pending' },
      relations: ['user', 'entry'],
      order: { createdAt: 'ASC' },
    });
  }

  async getFlaggedComments(requestingUserId: string) {
    // Verify user is an admin
    const user = await this.userRepository.findOne({ where: { id: requestingUserId } });
    if (!user || user.role !== 'admin') {
      throw new UnauthorizedError(VALIDATION_MESSAGES.ADMIN_ONLY);
    }
    
    return await this.commentRepository.find({
      where: { moderationStatus: 'flagged' },
      relations: ['user', 'entry'],
      order: { createdAt: 'ASC' },
    });
  }

  async flagComment(commentId: string, userId: string, reason?: string) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['entry', 'entry.author']
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    // Don't allow users to flag their own comments
    if (comment.userId === userId) {
      throw new Error('You cannot flag your own comment');
    }

    comment.moderationStatus = 'flagged';
    comment.moderationReason = reason || 'Flagged by user';
    comment.moderatedAt = new Date();

    await this.commentRepository.save(comment);

    // Send moderation notification to admin
    try {
      if (comment.entry && comment.entry.author) {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const moderationUrl = `${siteUrl}/dashboard/moderation`;
        
        await emailService.sendModerationNotification(
          comment.entry.author.email,
          {
            commentText: comment.text,
            commentId,
            entryTitle: comment.entry.title,
            flagReason: reason,
            moderationUrl
          }
        );
      }
    } catch (error) {
      logger.error('Failed to send moderation notification email', error);
    }

    return comment;
  }
}

export const interactionService = new InteractionService();
