import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../errors/AppError';
import { logger } from '../services/LoggerService';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error with context
  logger.logError('Request error', err, {
    method: req.method,
    path: req.path,
    ip: req.ip,
  });

  // Handle custom AppError instances
  if (err instanceof AppError) {
    const response: any = { error: err.message };
    
    // Include validation errors if present
    if (err instanceof ValidationError && err.errors) {
      response.errors = err.errors;
    }
    
    return res.status(err.statusCode).json(response);
  }

  // Legacy name-based error handling for backward compatibility
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.message,
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
    });
  }

  // Handle unexpected errors
  const statusCode = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message || 'Internal server error';

  return res.status(statusCode).json({
    error: message,
  });
};
