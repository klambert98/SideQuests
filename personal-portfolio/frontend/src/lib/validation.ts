// Frontend validation utilities and constants
// Matches backend validation limits for consistency

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
  ENTRY_TITLE_TOO_SHORT: `Title must be at least ${VALIDATION_LIMITS.ENTRY_TITLE_MIN} characters long`,
  ENTRY_TITLE_TOO_LONG: `Title must not exceed ${VALIDATION_LIMITS.ENTRY_TITLE_MAX} characters`,
  ENTRY_CONTENT_TOO_SHORT: `Content must be at least ${VALIDATION_LIMITS.ENTRY_CONTENT_MIN} characters long`,
  ENTRY_CONTENT_TOO_LONG: `Content must not exceed ${VALIDATION_LIMITS.ENTRY_CONTENT_MAX} characters`,
  ENTRY_SUMMARY_TOO_LONG: `Summary must not exceed ${VALIDATION_LIMITS.ENTRY_SUMMARY_MAX} characters`,
  TAG_TOO_LONG: `Tag must not exceed ${VALIDATION_LIMITS.TAG_MAX_LENGTH} characters`,
  TOO_MANY_TAGS: `Maximum ${VALIDATION_LIMITS.TAG_MAX_COUNT} tags allowed`,
};

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateComment(text: string, name?: string): ValidationResult {
  const errors: string[] = [];

  if (!text || !text.trim()) {
    errors.push(VALIDATION_MESSAGES.COMMENT_EMPTY);
  }

  if (text.length > VALIDATION_LIMITS.COMMENT_TEXT_MAX) {
    errors.push(VALIDATION_MESSAGES.COMMENT_TOO_LONG);
  }

  if (name && name.length > VALIDATION_LIMITS.COMMENT_NAME_MAX) {
    errors.push(VALIDATION_MESSAGES.COMMENT_NAME_TOO_LONG);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateEntry(
  title: string,
  content: string,
  summary?: string,
  tags?: string[]
): ValidationResult {
  const errors: string[] = [];

  if (!title || title.trim().length < VALIDATION_LIMITS.ENTRY_TITLE_MIN) {
    errors.push(VALIDATION_MESSAGES.ENTRY_TITLE_TOO_SHORT);
  }

  if (title.length > VALIDATION_LIMITS.ENTRY_TITLE_MAX) {
    errors.push(VALIDATION_MESSAGES.ENTRY_TITLE_TOO_LONG);
  }

  if (!content || content.trim().length < VALIDATION_LIMITS.ENTRY_CONTENT_MIN) {
    errors.push(VALIDATION_MESSAGES.ENTRY_CONTENT_TOO_SHORT);
  }

  if (content.length > VALIDATION_LIMITS.ENTRY_CONTENT_MAX) {
    errors.push(VALIDATION_MESSAGES.ENTRY_CONTENT_TOO_LONG);
  }

  if (summary && summary.length > VALIDATION_LIMITS.ENTRY_SUMMARY_MAX) {
    errors.push(VALIDATION_MESSAGES.ENTRY_SUMMARY_TOO_LONG);
  }

  if (tags && tags.length > VALIDATION_LIMITS.TAG_MAX_COUNT) {
    errors.push(VALIDATION_MESSAGES.TOO_MANY_TAGS);
  }

  if (tags) {
    tags.forEach((tag) => {
      if (tag.length > VALIDATION_LIMITS.TAG_MAX_LENGTH) {
        errors.push(`${VALIDATION_MESSAGES.TAG_TOO_LONG}: "${tag}"`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}
