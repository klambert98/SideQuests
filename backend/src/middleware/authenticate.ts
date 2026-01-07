import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest {
  userId?: string;
  user?: any;
  [key: string]: any;
}

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return secret;
};

export const authenticate = (req: any, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Optional authentication middleware - extracts userId if valid token is present,
 * but doesn't block the request if token is missing or invalid.
 * Used for endpoints that support both authenticated and anonymous access.
 */
export const optionalAuthenticate = (req: any, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    req.userId = undefined;
    return next();
  }

  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret) as { userId: string };
    req.userId = decoded.userId;
  } catch (error) {
    // Invalid or expired token - treat as unauthenticated
    req.userId = undefined;
  }

  next();
};
