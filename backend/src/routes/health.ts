import { Router, Request, Response } from 'express';
import { logger } from '../services/LoggerService';

export const healthRoutes = Router();

const FRONTEND_URL = process.env.NEXT_PUBLIC_API_URL 
  ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '')
  : 'http://localhost:3000';

// Basic health check
healthRoutes.get('/', (_req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'api'
  });
});

// Detailed health check with frontend ping
healthRoutes.get('/detailed', async (_req: Request, res: Response) => {
  const details: any = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'api',
    checks: {
      api: { status: 'healthy', timestamp: new Date().toISOString() },
      frontend: { status: 'unknown', timestamp: new Date().toISOString() }
    }
  };

  // Attempt to ping frontend
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const frontendResponse = await fetch(FRONTEND_URL, {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (frontendResponse.ok || frontendResponse.status === 404) {
      // 404 is still fine, means server is responding
      details.checks.frontend.status = 'healthy';
    } else {
      details.checks.frontend.status = 'degraded';
      details.checks.frontend.statusCode = frontendResponse.status;
    }
  } catch (error) {
    details.checks.frontend.status = 'unhealthy';
    details.checks.frontend.error = error instanceof Error ? error.message : 'Unknown error';
    logger.warn('Frontend health check failed:', error);
  }

  const allHealthy = Object.values(details.checks).every((check: any) => check.status === 'healthy');
  details.status = allHealthy ? 'OK' : 'DEGRADED';

  res.status(allHealthy ? 200 : 503).json(details);
});
