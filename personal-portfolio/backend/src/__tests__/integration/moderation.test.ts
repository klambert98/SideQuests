import { InteractionService } from '../../services/InteractionService';
import { AppDataSource } from '../../config/database';
import { Comment } from '../../entities/Comment';
import { Entry } from '../../entities/Entry';
import { User } from '../../entities/User';

describe('Integration Tests - Comment Moderation', () => {
  let interactionService: InteractionService;
  let commentRepository: any;
  let entryRepository: any;
  let userRepository: any;

  beforeAll(() => {
    // Mock repositories
    commentRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    entryRepository = {
      findOne: jest.fn(),
      increment: jest.fn(),
      decrement: jest.fn(),
    };

    userRepository = {
      findOne: jest.fn(),
    };

    // Create service with mocked repositories
    interactionService = new InteractionService();
    (interactionService as any).commentRepository = commentRepository;
    (interactionService as any).entryRepository = entryRepository;
    (interactionService as any).userRepository = userRepository;
  });

  describe('Comment Status Management', () => {
    it('should create comments with approved status by default', async () => {
      const mockComment = {
        id: '123',
        text: 'Test comment',
        entryId: 'entry-1',
        userId: 'user-1',
        moderationStatus: 'approved',
      };

      commentRepository.save.mockResolvedValue(mockComment);
      commentRepository.findOne.mockResolvedValue(mockComment);
      entryRepository.increment.mockResolvedValue({});

      const result = await interactionService.addComment('entry-1', 'user-1', 'Test comment');

      expect(commentRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should only return approved comments for public viewing', async () => {
      const mockComments = [
        { id: '1', text: 'Approved', moderationStatus: 'approved' },
        { id: '2', text: 'Pending', moderationStatus: 'pending' },
        { id: '3', text: 'Rejected', moderationStatus: 'rejected' },
      ];

      commentRepository.find.mockResolvedValue([mockComments[0]]);

      const result = await interactionService.getComments('entry-1');

      expect(commentRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            moderationStatus: 'approved',
          }),
        })
      );
    });
  });

  describe('Moderation Actions', () => {
    it('should allow moderators to approve comments', async () => {
      const mockComment = {
        id: '123',
        text: 'Test',
        moderationStatus: 'pending',
      };

      commentRepository.findOne.mockResolvedValue(mockComment);
      commentRepository.save.mockResolvedValue({
        ...mockComment,
        moderationStatus: 'approved',
        moderatedBy: 'admin-1',
      });

      const result = await interactionService.moderateComment('123', 'admin-1', 'approved');

      expect(commentRepository.save).toHaveBeenCalled();
      expect(result.moderationStatus).toBe('approved');
    });

    it('should allow moderators to reject comments', async () => {
      const mockComment = {
        id: '123',
        text: 'Test',
        moderationStatus: 'approved',
      };

      commentRepository.findOne.mockResolvedValue(mockComment);
      commentRepository.save.mockResolvedValue({
        ...mockComment,
        moderationStatus: 'rejected',
        moderationReason: 'Spam',
      });

      const result = await interactionService.moderateComment('123', 'admin-1', 'rejected', 'Spam');

      expect(result.moderationStatus).toBe('rejected');
      expect(result.moderationReason).toBe('Spam');
    });

    it('should allow users to flag comments', async () => {
      const mockComment = {
        id: '123',
        text: 'Test',
        userId: 'user-2',
        moderationStatus: 'approved',
        entry: {
          id: 'entry-1',
          title: 'Test Entry',
          author: { email: 'admin@test.com' },
        },
      };

      commentRepository.findOne.mockResolvedValue(mockComment);
      commentRepository.save.mockResolvedValue({
        ...mockComment,
        moderationStatus: 'flagged',
      });

      const result = await interactionService.flagComment('123', 'user-1', 'Inappropriate');

      expect(result.moderationStatus).toBe('flagged');
    });

    it('should not allow users to flag their own comments', async () => {
      const mockComment = {
        id: '123',
        userId: 'user-1',
      };

      commentRepository.findOne.mockResolvedValue(mockComment);

      await expect(
        interactionService.flagComment('123', 'user-1', 'Test')
      ).rejects.toThrow('You cannot flag your own comment');
    });
  });

  describe('Pending and Flagged Comments', () => {
    it('should retrieve all pending comments', async () => {
      const mockComments = [
        { id: '1', text: 'Pending 1', moderationStatus: 'pending' },
        { id: '2', text: 'Pending 2', moderationStatus: 'pending' },
      ];

      commentRepository.find.mockResolvedValue(mockComments);

      const result = await interactionService.getPendingComments();

      expect(commentRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { moderationStatus: 'pending' },
        })
      );
      expect(result).toHaveLength(2);
    });

    it('should retrieve all flagged comments', async () => {
      const mockComments = [
        { id: '1', text: 'Flagged 1', moderationStatus: 'flagged' },
      ];

      commentRepository.find.mockResolvedValue(mockComments);

      const result = await interactionService.getFlaggedComments();

      expect(commentRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { moderationStatus: 'flagged' },
        })
      );
      expect(result).toHaveLength(1);
    });
  });
});
