import { Resend } from 'resend';
import { logger } from './LoggerService';
import { EMAIL_REGEX } from '../constants/validation';

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export interface CommentNotificationData {
  entryTitle: string;
  entryId: string;
  commentText: string;
  commenterName: string;
  entryUrl: string;
}

export interface ModerationNotificationData {
  commentText: string;
  commentId: string;
  entryTitle: string;
  flagReason?: string;
  moderationUrl: string;
}

export class EmailService {
  private resend: Resend | null = null;
  private isConfigured: boolean = false;
  private fromEmail: string = '';

  constructor() {
    this.initialize();
  }

  private initialize() {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    // Only configure if Resend API key is provided
    if (apiKey) {
      this.resend = new Resend(apiKey);
      this.fromEmail = fromEmail;
      this.isConfigured = true;
      logger.info('Email service configured with Resend');
    } else {
      logger.warn('Email service not configured - RESEND_API_KEY missing');
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isConfigured || !this.resend) {
      logger.warn('Email not sent - service not configured');
      return false;
    }
    
    // Validate email address
    if (!EMAIL_REGEX.test(options.to)) {
      logger.error('Invalid email address:', options.to);
      return false;
    }

    try {
      const response = await this.resend.emails.send({
        from: this.fromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html || options.text || '',
      });

      if (response.error) {
        logger.error('Failed to send email:', response.error);
        return false;
      }

      logger.info(`Email sent: ${response.data?.id}`);
      return true;
    } catch (error) {
      logger.error('Failed to send email', error);
      return false;
    }
  }

  async sendCommentNotification(to: string, data: CommentNotificationData): Promise<boolean> {
    const subject = `New comment on "${data.entryTitle}"`;
    
    const text = `
Hello,

${data.commenterName} left a comment on your entry "${data.entryTitle}":

"${data.commentText}"

View the entry: ${data.entryUrl}

---
This is an automated notification from your portfolio site.
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .comment-box { background: #f5f5f5; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0; }
    .button { display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <h2>New Comment on Your Entry</h2>
    <p><strong>${data.commenterName}</strong> left a comment on <em>"${data.entryTitle}"</em>:</p>
    <div class="comment-box">
      ${data.commentText}
    </div>
    <a href="${data.entryUrl}" class="button">View Entry</a>
    <div class="footer">
      This is an automated notification from your portfolio site.
    </div>
  </div>
</body>
</html>
    `.trim();

    return await this.sendEmail({ to, subject, text, html });
  }

  async sendModerationNotification(to: string, data: ModerationNotificationData): Promise<boolean> {
    const subject = data.flagReason ? `Comment flagged for moderation` : `New comment awaiting review`;
    
    const text = `
Hello Admin,

A comment ${data.flagReason ? 'has been flagged for moderation' : 'is awaiting your review'} on "${data.entryTitle}".

Comment: "${data.commentText}"
${data.flagReason ? `Reason: ${data.flagReason}` : ''}

Review and moderate: ${data.moderationUrl}

---
This is an automated notification from your portfolio site.
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .alert-box { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
    .comment-box { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0; }
    .button { display: inline-block; padding: 10px 20px; background: #ffc107; color: #333; text-decoration: none; border-radius: 5px; margin-top: 20px; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <h2>${data.flagReason ? '⚠️ Comment Flagged for Moderation' : '📝 New Comment Awaiting Review'}</h2>
    <div class="alert-box">
      <p>A comment on <strong>"${data.entryTitle}"</strong> ${data.flagReason ? 'has been flagged and' : ''} requires your review.</p>
    </div>
    <div class="comment-box">
      <p><strong>Comment:</strong></p>
      <p>${data.commentText}</p>
      ${data.flagReason ? `<p><strong>Reason:</strong> ${data.flagReason}</p>` : ''}
    </div>
    <a href="${data.moderationUrl}" class="button">Review & Moderate</a>
    <div class="footer">
      This is an automated notification from your portfolio site.
    </div>
  </div>
</body>
</html>
    `.trim();

    return await this.sendEmail({ to, subject, text, html });
  }

  async sendLikeNotification(to: string, entryTitle: string, userName: string, entryUrl: string): Promise<boolean> {
    const subject = `${userName} liked your entry`;
    
    const text = `
Hello,

${userName} liked your entry "${entryTitle}".

View the entry: ${entryUrl}

---
This is an automated notification from your portfolio site.
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .like-box { background: #e7f3ff; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0; }
    .button { display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <h2>❤️ Someone Liked Your Entry!</h2>
    <div class="like-box">
      <p><strong>${userName}</strong> liked your entry <em>"${entryTitle}"</em></p>
    </div>
    <a href="${entryUrl}" class="button">View Entry</a>
    <div class="footer">
      This is an automated notification from your portfolio site.
    </div>
  </div>
</body>
</html>
    `.trim();

    return await this.sendEmail({ to, subject, text, html });
  }
}

export const emailService = new EmailService();
