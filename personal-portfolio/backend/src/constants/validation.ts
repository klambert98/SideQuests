// Validation constants for reusability across the application
export const VALIDATION_LIMITS = {
  COMMENT_TEXT_MIN: 1,
  COMMENT_TEXT_MAX: 5000,
  COMMENT_NAME_MAX: 100,
  ENTRY_TITLE_MIN: 3,
  ENTRY_TITLE_MAX: 255,
  ENTRY_CONTENT_MIN: 10,
  ENTRY_CONTENT_MAX: 50000,
  ENTRY_SUMMARY_MAX: 500,
  TAG_MAX_LENGTH: 50,
  TAG_MAX_COUNT: 20,
};

export const VALIDATION_MESSAGES = {
  COMMENT_EMPTY: 'Comment cannot be empty',
  COMMENT_TOO_LONG: `Comment exceeds maximum length of ${VALIDATION_LIMITS.COMMENT_TEXT_MAX} characters`,
  COMMENT_NAME_TOO_LONG: `Name exceeds maximum length of ${VALIDATION_LIMITS.COMMENT_NAME_MAX} characters`,
  UNAUTHORIZED: 'Unauthorized access',
  ADMIN_ONLY: 'Only admins can perform this action',
  NOT_FOUND: 'Resource not found',
};

// Email validation regex (RFC 5322 simplified)
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Rate limiting constants
export const RATE_LIMITS = {
  GENERAL_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  GENERAL_MAX_REQUESTS: 100,
  COMMENT_WINDOW_MS: 60 * 1000, // 1 minute
  COMMENT_MAX_REQUESTS: 5,
  LIKE_WINDOW_MS: 60 * 1000, // 1 minute
  LIKE_MAX_REQUESTS: 10,
  AUTH_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  AUTH_MAX_ATTEMPTS: 5,
};
