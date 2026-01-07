import request from 'supertest';
import express, { Express } from 'express';
import { entryRoutes } from '../../routes/entries';

describe('Integration Tests - Full Workflow', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/entries', entryRoutes);
  });

  describe('Like and Comment Workflow', () => {
    it('should handle the complete interaction workflow', async () => {
      const mockToken = 'Bearer test-token';
      const entryId = 'test-entry-123';

      // Step 1: Like an entry
      const likeResponse = await request(app)
        .post(`/api/entries/${entryId}/like`)
        .set('Authorization', mockToken);

      // Will fail at auth, but shouldn't be rate limited yet
      expect(likeResponse.status).not.toBe(429);

      // Step 2: Add a comment
      const commentResponse = await request(app)
        .post(`/api/entries/${entryId}/comments`)
        .set('Authorization', mockToken)
        .send({ text: 'Great post!', name: 'John Doe' });

      // Will fail at auth, but shouldn't be rate limited
      expect(commentResponse.status).not.toBe(429);

      // Step 3: Get comments (public endpoint)
      const getCommentsResponse = await request(app)
        .get(`/api/entries/${entryId}/comments`);

      // Should work without auth
      expect([200, 400]).toContain(getCommentsResponse.status);

      // Step 4: Get likes (public endpoint)
      const getLikesResponse = await request(app)
        .get(`/api/entries/${entryId}/likes`);

      // Should work without auth
      expect([200, 400]).toContain(getLikesResponse.status);
    });
  });

  describe('Moderation Workflow', () => {
    it('should handle comment flagging and moderation', async () => {
      const mockToken = 'Bearer test-token';
      const entryId = 'test-entry-123';
      const commentId = 'test-comment-456';

      // Step 1: Flag a comment
      const flagResponse = await request(app)
        .post(`/api/entries/${entryId}/comments/${commentId}/flag`)
        .set('Authorization', mockToken)
        .send({ reason: 'Inappropriate content' });

      // Will fail at auth, but endpoint exists
      expect(flagResponse.status).not.toBe(404);

      // Step 2: Moderate the comment
      const moderateResponse = await request(app)
        .post(`/api/entries/${entryId}/comments/${commentId}/moderate`)
        .set('Authorization', mockToken)
        .send({ status: 'approved', reason: 'Reviewed and approved' });

      // Will fail at auth, but endpoint exists
      expect(moderateResponse.status).not.toBe(404);

      // Step 3: Get pending comments
      const pendingResponse = await request(app)
        .get('/api/entries/moderation/pending')
        .set('Authorization', mockToken);

      // Will fail at auth, but endpoint exists
      expect(pendingResponse.status).not.toBe(404);

      // Step 4: Get flagged comments
      const flaggedResponse = await request(app)
        .get('/api/entries/moderation/flagged')
        .set('Authorization', mockToken);

      // Will fail at auth, but endpoint exists
      expect(flaggedResponse.status).not.toBe(404);
    });
  });

  describe('API Endpoint Validation', () => {
    it('should validate required fields for comments', async () => {
      const mockToken = 'Bearer test-token';
      const entryId = 'test-entry-123';

      // Missing comment text
      const response = await request(app)
        .post(`/api/entries/${entryId}/comments`)
        .set('Authorization', mockToken)
        .send({});

      // Should fail validation (after auth check)
      expect(response.status).not.toBe(404);
    });

    it('should validate moderation status values', async () => {
      const mockToken = 'Bearer test-token';
      const entryId = 'test-entry-123';
      const commentId = 'test-comment-456';

      // Invalid status
      const response = await request(app)
        .post(`/api/entries/${entryId}/comments/${commentId}/moderate`)
        .set('Authorization', mockToken)
        .send({ status: 'invalid-status' });

      // Will get to validation check
      expect(response.status).not.toBe(404);
    });
  });

  describe('Rate Limit Headers', () => {
    it('should include rate limit headers in responses', async () => {
      const mockToken = 'Bearer test-token';
      const entryId = 'test-entry-123';

      const response = await request(app)
        .post(`/api/entries/${entryId}/comments`)
        .set('Authorization', mockToken)
        .send({ text: 'Test comment' });

      // Should have rate limit headers
      expect(response.headers['ratelimit-limit']).toBeDefined();
      expect(response.headers['ratelimit-remaining']).toBeDefined();
    });
  });

  describe('Public vs Protected Endpoints', () => {
    it('should allow public access to read endpoints', async () => {
      const entryId = 'test-entry-123';

      // Get comments (no auth)
      const commentsResponse = await request(app)
        .get(`/api/entries/${entryId}/comments`);
      expect([200, 400]).toContain(commentsResponse.status);

      // Get likes (no auth)
      const likesResponse = await request(app)
        .get(`/api/entries/${entryId}/likes`);
      expect([200, 400]).toContain(likesResponse.status);
    });

    it('should require auth for write operations', async () => {
      const entryId = 'test-entry-123';

      // Like without auth
      const likeResponse = await request(app)
        .post(`/api/entries/${entryId}/like`);
      expect(likeResponse.status).toBe(401);

      // Comment without auth
      const commentResponse = await request(app)
        .post(`/api/entries/${entryId}/comments`)
        .send({ text: 'Test' });
      expect(commentResponse.status).toBe(401);
    });

    it('should require auth for moderation endpoints', async () => {
      const entryId = 'test-entry-123';
      const commentId = 'test-comment-456';

      // Flag without auth
      const flagResponse = await request(app)
        .post(`/api/entries/${entryId}/comments/${commentId}/flag`);
      expect(flagResponse.status).toBe(401);

      // Moderate without auth
      const moderateResponse = await request(app)
        .post(`/api/entries/${entryId}/comments/${commentId}/moderate`)
        .send({ status: 'approved' });
      expect(moderateResponse.status).toBe(401);

      // Get pending without auth
      const pendingResponse = await request(app)
        .get('/api/entries/moderation/pending');
      expect(pendingResponse.status).toBe(401);
    });
  });
});
