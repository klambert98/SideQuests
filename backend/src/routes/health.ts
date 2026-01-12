import { Router, Request, Response } from 'express';

export const healthRoutes = Router();

// Basic health check
healthRoutes.get('/', (_req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'api'
  });
});

// Detailed health check (API only)
healthRoutes.get('/detailed', async (_req: Request, res: Response) => {
  const details = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'api',
    checks: {
      api: { status: 'healthy', timestamp: new Date().toISOString() }
    }
  };

  res.json(details);
});
