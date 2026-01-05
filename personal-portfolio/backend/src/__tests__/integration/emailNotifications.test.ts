import { EmailService } from '../../services/EmailService';

describe('Integration Tests - Email Notifications', () => {
  let emailService: EmailService;
  let mockTransporter: any;

  beforeEach(() => {
    // Mock environment variables
    process.env.SMTP_HOST = 'smtp.test.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'test@test.com';
    process.env.SMTP_PASS = 'password';
    process.env.SMTP_FROM = 'noreply@test.com';

    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({ messageId: '123' }),
    };

    emailService = new EmailService();
    (emailService as any).transporter = mockTransporter;
    (emailService as any).isConfigured = true;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Comment Notifications', () => {
    it('should send email when new comment is added', async () => {
      const notificationData = {
        entryTitle: 'My Entry',
        entryId: '123',
        commentText: 'Great post!',
        commenterName: 'John Doe',
        entryUrl: 'http://localhost:3000/entries/123',
      };

      const result = await emailService.sendCommentNotification('author@test.com', notificationData);

      expect(mockTransporter.sendMail).toHaveBeenCalled();
      expect(result).toBe(true);

      const emailCall = mockTransporter.sendMail.mock.calls[0][0];
      expect(emailCall.to).toBe('author@test.com');
      expect(emailCall.subject).toContain('New comment');
      expect(emailCall.html).toContain('John Doe');
      expect(emailCall.html).toContain('Great post!');
    });
  });

  describe('Like Notifications', () => {
    it('should send email when entry is liked', async () => {
      const result = await emailService.sendLikeNotification(
        'author@test.com',
        'My Entry',
        'Jane Smith',
        'http://localhost:3000/entries/123'
      );

      expect(mockTransporter.sendMail).toHaveBeenCalled();
      expect(result).toBe(true);

      const emailCall = mockTransporter.sendMail.mock.calls[0][0];
      expect(emailCall.to).toBe('author@test.com');
      expect(emailCall.subject).toContain('liked your entry');
      expect(emailCall.html).toContain('Jane Smith');
    });
  });

  describe('Moderation Notifications', () => {
    it('should send email when comment is flagged', async () => {
      const moderationData = {
        commentText: 'Inappropriate comment',
        commentId: '456',
        entryTitle: 'My Entry',
        flagReason: 'Spam',
        moderationUrl: 'http://localhost:3000/dashboard/moderation',
      };

      const result = await emailService.sendModerationNotification('admin@test.com', moderationData);

      expect(mockTransporter.sendMail).toHaveBeenCalled();
      expect(result).toBe(true);

      const emailCall = mockTransporter.sendMail.mock.calls[0][0];
      expect(emailCall.to).toBe('admin@test.com');
      expect(emailCall.subject).toContain('flagged');
      expect(emailCall.html).toContain('Spam');
    });
  });

  describe('Error Handling', () => {
    it('should handle email sending failures gracefully', async () => {
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP error'));

      const result = await emailService.sendEmail({
        to: 'test@test.com',
        subject: 'Test',
        text: 'Test message',
      });

      expect(result).toBe(false);
    });

    it('should skip sending when not configured', async () => {
      const unconfiguredService = new EmailService();
      (unconfiguredService as any).isConfigured = false;
      (unconfiguredService as any).transporter = null;

      const result = await unconfiguredService.sendEmail({
        to: 'test@test.com',
        subject: 'Test',
        text: 'Test message',
      });

      expect(result).toBe(false);
    });
  });

  describe('Email Content Validation', () => {
    it('should include all necessary information in comment notification', async () => {
      const notificationData = {
        entryTitle: 'Test Entry',
        entryId: '123',
        commentText: 'This is a test comment',
        commenterName: 'Test User',
        entryUrl: 'http://test.com/entries/123',
      };

      await emailService.sendCommentNotification('user@test.com', notificationData);

      const emailCall = mockTransporter.sendMail.mock.calls[0][0];
      
      // Check HTML content includes all data
      expect(emailCall.html).toContain(notificationData.entryTitle);
      expect(emailCall.html).toContain(notificationData.commentText);
      expect(emailCall.html).toContain(notificationData.commenterName);
      expect(emailCall.html).toContain(notificationData.entryUrl);

      // Check plain text content
      expect(emailCall.text).toContain(notificationData.commentText);
      expect(emailCall.text).toContain(notificationData.entryUrl);
    });
  });
});
