/**
 * Environment Variable Validation
 * Validates required environment variables at application startup
 * to fail fast if configuration is incomplete.
 */

import { logger } from '../services/LoggerService';
import { EMAIL_REGEX } from '../constants/validation';

interface EnvConfig {
  required: string[];
  optional: string[];
  validated: {
    [key: string]: (value: string) => boolean;
  };
}

const ENV_CONFIG: EnvConfig = {
  required: [
    'DATABASE_URL',
    'JWT_SECRET',
  ],
  optional: [
    'RESEND_API_KEY',
    'RESEND_FROM_EMAIL',
    'ADMIN_EMAIL',
    'CORS_ORIGIN',
    'NEXT_PUBLIC_SITE_URL',
    'MAX_FILE_SIZE',
    'ALLOWED_FILE_TYPES',
  ],
  validated: {
    ADMIN_EMAIL: (value: string) => {
      if (!value) return true; // Optional
      if (!EMAIL_REGEX.test(value)) {
        logger.error(`Invalid ADMIN_EMAIL format: ${value}`);
        return false;
      }
      return true;
    },
    RESEND_FROM_EMAIL: (value: string) => {
      if (!value) return true; // Optional
      if (!EMAIL_REGEX.test(value)) {
        logger.error(`Invalid RESEND_FROM_EMAIL format: ${value}`);
        return false;
      }
      return true;
    },
    JWT_SECRET: (value: string) => {
      if (value.length < 32) {
        logger.warn('JWT_SECRET should be at least 32 characters for security');
        // Don't fail, just warn
      }
      return true;
    },
    DATABASE_URL: (value: string) => {
      // Basic validation - should start with postgres:// or postgresql://
      if (!value.startsWith('postgres://') && !value.startsWith('postgresql://')) {
        logger.error('DATABASE_URL should start with postgres:// or postgresql://');
        return false;
      }
      return true;
    },
  },
};

export function validateEnvironmentVariables(): void {
  logger.info('Validating environment variables...');

  const missingRequired: string[] = [];
  const invalidVariables: string[] = [];

  // Check required variables
  for (const varName of ENV_CONFIG.required) {
    const value = process.env[varName];
    if (!value) {
      missingRequired.push(varName);
      continue;
    }

    // Run custom validation if defined
    const validator = ENV_CONFIG.validated[varName];
    if (validator && !validator(value)) {
      invalidVariables.push(varName);
    }
  }

  // Validate optional variables if they exist
  for (const varName of ENV_CONFIG.optional) {
    const value = process.env[varName];
    if (value) {
      const validator = ENV_CONFIG.validated[varName];
      if (validator && !validator(value)) {
        invalidVariables.push(varName);
      }
    }
  }

  // Log warnings for optional but recommended variables
  if (!process.env.RESEND_API_KEY) {
    logger.warn('RESEND_API_KEY not set - email notifications will be disabled');
  }

  if (!process.env.ADMIN_EMAIL) {
    logger.warn('ADMIN_EMAIL not set - admin notifications will not be sent');
  }

  // Report errors
  if (missingRequired.length > 0) {
    logger.error('Missing required environment variables:');
    missingRequired.forEach(varName => {
      logger.error(`  - ${varName}`);
    });
    throw new Error(`Missing required environment variables: ${missingRequired.join(', ')}`);
  }

  if (invalidVariables.length > 0) {
    logger.error('Invalid environment variable values:');
    invalidVariables.forEach(varName => {
      logger.error(`  - ${varName}`);
    });
    throw new Error(`Invalid environment variable values: ${invalidVariables.join(', ')}`);
  }

  logger.info('Environment variables validated successfully');

  // Log configuration summary (without sensitive values)
  logger.info('Configuration summary:');
  logger.info(`  - Database: ${process.env.DATABASE_URL ? 'Configured' : 'Not configured'}`);
  logger.info(`  - JWT Secret: ${process.env.JWT_SECRET ? 'Configured' : 'Not configured'}`);
  logger.info(`  - Email Service: ${process.env.RESEND_API_KEY ? 'Enabled' : 'Disabled'}`);
  logger.info(`  - CORS Origin: ${process.env.CORS_ORIGIN || 'Not set'}`);
  logger.info(`  - Admin Email: ${process.env.ADMIN_EMAIL || 'Not set'}`);
}
