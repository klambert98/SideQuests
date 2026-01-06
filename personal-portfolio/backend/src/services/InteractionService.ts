import { AppDataSource } from '../config/database';
import { Like } from '../entities/Like';
import { Comment, ModerationStatus } from '../entities/Comment';
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

  async addComment(entryId: string, userId: string | null, text: string, name?: string, sessionToken?: string) {
    if (!text.trim()) {
      throw new ValidationError(VALIDATION_MESSAGES.COMMENT_EMPTY);
    }
    
    if (text.length > VALIDATION_LIMITS.COMMENT_TEXT_MAX) {
      throw new ValidationError(VALIDATION_MESSAGES.COMMENT_TOO_LONG);
    }
    
    if (name && name.length > VALIDATION_LIMITS.COMMENT_NAME_MAX) {
      throw new ValidationError(VALIDATION_MESSAGES.COMMENT_NAME_TOO_LONG);
    }

    // Generate session token if not provided (for anonymous users)
    const crypto = require('crypto');
    const finalSessionToken = sessionToken || crypto.randomBytes(32).toString('hex');

    const comment = new Comment();
    comment.entryId = entryId;
    comment.userId = userId;
    comment.sessionToken = userId ? null : finalSessionToken; // Only set sessionToken for anonymous users
    comment.text = text;
    comment.name = name && name.trim() ? name.trim() : null;
    // Auto-approve comments from authenticated users
    comment.moderationStatus = userId ? 'approved' : 'pending';

    const savedComment = await this.commentRepository.save(comment);

    // Increment comments count on entry
    await this.entryRepository.increment({ id: entryId }, 'comments_count', 1);

    // Send moderation notification for pending comment
    try {
      const entry = await this.entryRepository.findOne({ 
        where: { id: entryId },
        relations: ['author']
      });

      if (entry && savedComment.moderationStatus === 'pending') {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const moderationUrl = `${siteUrl}/dashboard/moderation`;
        const adminEmail = process.env.ADMIN_EMAIL;
        
        const commenterName = name || (userId ? 'Authenticated user' : 'Anonymous');
        
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

    // Return comment with user data and session token (for anonymous users to track their comments)
    const returnedComment = await this.commentRepository.findOne({
      where: { id: savedComment.id },
      relations: ['user'],
    });

    // Include sessionToken in response for anonymous users
    return {
      ...returnedComment,
      sessionToken: userId ? undefined : finalSessionToken
    };
  }

  async getComments(entryId: string, userId?: string, sessionToken?: string) {
    const baseApprovedCondition = { entryId, moderationStatus: 'approved' as ModerationStatus };
    
    const conditions: any[] = [baseApprovedCondition];

    // If userId provided, include their pending comments
    if (userId) {
      conditions.push({ entryId, userId, moderationStatus: 'pending' as ModerationStatus });
    }

    // If sessionToken provided, include pending comments from this session
    if (sessionToken) {
      conditions.push({ entryId, sessionToken, moderationStatus: 'pending' as ModerationStatus });
    }

    return await this.commentRepository.find({
      where: conditions,
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  async deleteComment(commentId: string, entryId: string, userId?: string, sessionToken?: string) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    // Check if user is an admin
    let isAdmin = false;
    if (userId) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      isAdmin = user?.role === 'admin';
    }

    // Allow deletion if:
    // 1. User is an admin
    // 2. User is authenticated and owns the comment
    // 3. User has matching sessionToken (anonymous) and comment is still pending
    const canDelete = 
      isAdmin ||
      (userId && comment.userId === userId) ||
      (sessionToken && comment.sessionToken === sessionToken && comment.moderationStatus === 'pending');

    if (!canDelete) {
      throw new UnauthorizedError('You can only delete your own comments');
    }

    await this.commentRepository.remove(comment);

    // Decrement comments count
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
