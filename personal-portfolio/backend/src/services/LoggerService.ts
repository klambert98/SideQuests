export class LoggerService {
  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] ${message}`;
  }

  log(message: string, data?: any) {
    console.log(this.formatMessage('INFO', message), data !== undefined ? data : '');
  }

  error(message: string, error?: any) {
    console.error(this.formatMessage('ERROR', message), error !== undefined ? error : '');
    
    // Log stack trace if available
    if (error?.stack) {
      console.error('Stack trace:', error.stack);
    }
  }

  warn(message: string, data?: any) {
    console.warn(this.formatMessage('WARN', message), data !== undefined ? data : '');
  }

  debug(message: string, data?: any) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('DEBUG', message), data !== undefined ? data : '');
    }
  }

  info(message: string, data?: any) {
    console.info(this.formatMessage('INFO', message), data !== undefined ? data : '');
  }

  // Request logging helper
  logRequest(method: string, path: string, userId?: string) {
    this.log(`${method} ${path}`, userId ? { userId } : undefined);
  }

  // Error logging with context
  logError(message: string, error: any, context?: Record<string, any>) {
    this.error(message, {
      error: error.message,
      stack: error.stack,
      ...context,
    });
  }
}

export const logger = new LoggerService();
