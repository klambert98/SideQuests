// Frontend validation utilities using shared constants
import { VALIDATION_LIMITS, VALIDATION_MESSAGES } from '@portfolio/shared/validation';

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
