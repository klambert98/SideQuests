import { VALIDATION_LIMITS as SHARED_LIMITS, VALIDATION_MESSAGES as SHARED_MESSAGES } from '@portfolio/shared';

export const VALIDATION_LIMITS = SHARED_LIMITS;
export const VALIDATION_MESSAGES = {
  ...SHARED_MESSAGES,
  UNAUTHORIZED: 'Unauthorized access',
  ADMIN_ONLY: 'Only admins can perform this action',
  NOT_FOUND: 'Resource not found',
};

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const RATE_LIMITS = {
  GENERAL_WINDOW_MS: 15 * 60 * 1000,
  GENERAL_MAX_REQUESTS: 100,
  COMMENT_WINDOW_MS: 60 * 1000,
  COMMENT_MAX_REQUESTS: 5,
  LIKE_WINDOW_MS: 60 * 1000,
  LIKE_MAX_REQUESTS: 10,
  AUTH_WINDOW_MS: 15 * 60 * 1000,
  AUTH_MAX_ATTEMPTS: 5,
};
