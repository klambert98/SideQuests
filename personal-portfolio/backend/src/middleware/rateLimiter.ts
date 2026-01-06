import rateLimit from 'express-rate-limit';
import { RATE_LIMITS } from '../constants/validation';

// Helper to get client IP, respecting X-Forwarded-For for proxies
const getClientIp = (req: any) => {
  if (process.env.NODE_ENV === 'production') {
    // In production (Fly.io), trust X-Forwarded-For
    return req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
  }
  return req.ip;
};

// General API rate limiter
export const generalLimiter = rateLimit({
  windowMs: RATE_LIMITS.GENERAL_WINDOW_MS,
  max: RATE_LIMITS.GENERAL_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req: any) => getClientIp(req),
});

// Stricter limiter for write operations (comments, likes)
export const interactionLimiter = rateLimit({
  windowMs: RATE_LIMITS.GENERAL_WINDOW_MS,
  max: 30, // Limit each IP to 30 write operations per windowMs
  message: 'Too many interactions from this IP, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: any) => getClientIp(req),
});

// Very strict limiter for comment creation
export const commentLimiter = rateLimit({
  windowMs: RATE_LIMITS.COMMENT_WINDOW_MS,
  max: RATE_LIMITS.COMMENT_MAX_REQUESTS,
  message: 'You are posting comments too quickly. Please wait before posting again.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all requests, not just successful ones
  keyGenerator: (req: any) => getClientIp(req),
});

// Like/unlike limiter
export const likeLimiter = rateLimit({
  windowMs: RATE_LIMITS.LIKE_WINDOW_MS,
  max: RATE_LIMITS.LIKE_MAX_REQUESTS,
  message: 'Too many like/unlike actions. Please wait a moment.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: any) => getClientIp(req),
});

// Auth limiter (for login attempts)
export const authLimiter = rateLimit({
  windowMs: RATE_LIMITS.AUTH_WINDOW_MS,
  max: RATE_LIMITS.AUTH_MAX_ATTEMPTS,
  message: 'Too many login attempts from this IP, please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});
