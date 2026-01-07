import request from 'supertest';
import express, { Express } from 'express';
import { entryRoutes } from '../../routes/entries';
import { authRoutes } from '../../routes/auth';

describe('Integration Tests - Rate Limiting', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    app.use('/api/entries', entryRoutes);
  });

  describe('Comment Rate Limiting', () => {
    it('should allow up to 5 comments per minute', async () => {
      const mockToken = 'Bearer mock-token';
      
      // First 5 requests should succeed (or get to auth check)
      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .post('/api/entries/test-id/comments')
          .set('Authorization', mockToken)
          .send({ text: `Test comment ${i}` });
        
        // Should fail at auth, not rate limit
        expect(response.status).not.toBe(429);
      }

      // 6th request should be rate limited
      const response = await request(app)
        .post('/api/entries/test-id/comments')
        .set('Authorization', mockToken)
        .send({ text: 'Test comment 6' });
      
      expect(response.status).toBe(429);
      expect(response.body).toHaveProperty('message');
    }, 15000);
  });

  describe('Like Rate Limiting', () => {
    it('should allow up to 10 likes per minute', async () => {
      const mockToken = 'Bearer mock-token';
      
      // First 10 requests should succeed (or get to auth check)
      for (let i = 0; i < 10; i++) {
        const response = await request(app)
          .post('/api/entries/test-id/like')
          .set('Authorization', mockToken);
        
        // Should fail at auth, not rate limit
        expect(response.status).not.toBe(429);
      }

      // 11th request should be rate limited
      const response = await request(app)
        .post('/api/entries/test-id/like')
        .set('Authorization', mockToken);
      
      expect(response.status).toBe(429);
    }, 15000);
  });

  describe('Auth Rate Limiting', () => {
    it('should allow up to 5 login attempts per 15 minutes', async () => {
      // First 5 requests should succeed (or get validation error)
      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({ email: 'test@example.com', password: 'password' });
        
        // Should fail at validation/auth, not rate limit
        expect(response.status).not.toBe(429);
      }

      // 6th request should be rate limited
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password' });
      
      expect(response.status).toBe(429);
      expect(response.body).toHaveProperty('message');
    }, 15000);
  });
});
