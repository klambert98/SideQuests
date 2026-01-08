import 'dotenv/config';
import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import { randomUUID } from 'crypto';
import 'reflect-metadata';
import { AppDataSource } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './routes/auth';
import { entryRoutes } from './routes/entries';
import { mediaRoutes } from './routes/media';
import { embedRoutes } from './routes/embeds';
import { bucketListRoutes } from './routes/bucketList';
import { logger } from './services/LoggerService';
import { generalLimiter } from './middleware/rateLimiter';
import { validateEnvironmentVariables } from './utils/envValidation';

const app: Express = express();
const PORT = parseInt(process.env.API_PORT || '3001', 10);
const BODY_LIMIT = process.env.BODY_LIMIT || '50mb';

// Validate environment variables at startup
try {
  validateEnvironmentVariables();
} catch (error) {
  logger.error('Environment validation failed:', error);
  process.exit(1);
}

// Trust Fly.io proxy
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// CORS Configuration
const corsOrigin = process.env.CORS_ORIGIN;
if (!corsOrigin && process.env.NODE_ENV === 'production') {
  throw new Error('CORS_ORIGIN environment variable is required in production');
}

// Allow multiple origins in development
const allowedOrigins = corsOrigin 
  ? corsOrigin.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:3002'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like Postman, curl, or server-to-server)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if the origin is in the allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Reject other origins
    return callback(new Error(`Origin ${origin} not allowed by CORS`), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Security middleware
app.use(helmet());

// Global rate limiter
app.use(generalLimiter);

// Request ID tracking middleware
app.use((req: any, res: Response, next) => {
  const requestId = req.headers['x-request-id'] || randomUUID();
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  
  // Log request with ID
  logger.info(`[${requestId}] ${req.method} ${req.path}`);
  
  next();
});

app.use(express.json({ limit: BODY_LIMIT }));
app.use(express.urlencoded({ limit: BODY_LIMIT, extended: true }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Serve uploaded files as static
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/embeds', embedRoutes);
app.use('/api/bucket-list', bucketListRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    await AppDataSource.initialize();
    logger.info('Database connected');

    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server running on http://0.0.0.0:${PORT}`);
      logger.info(`API available at http://0.0.0.0:${PORT}/api`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();

export default app;
