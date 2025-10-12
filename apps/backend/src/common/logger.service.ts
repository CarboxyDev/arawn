import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

@Injectable()
export class LoggerService implements NestLoggerService {
  /**
   * Structured logger service with formatted output
   *
   * Provides consistent log formatting with timestamps and context.
   * Uses native console methods for simplicity - easily extendable to Winston/Pino if needed.
   */

  private formatMessage(level: string, message: string, context?: string) {
    const timestamp = new Date().toISOString();
    const ctx = context ? `[${context}]` : '';
    return `${timestamp} ${level.toUpperCase()} ${ctx} ${message}`;
  }

  log(message: string, context?: string) {
    console.log(this.formatMessage('info', message, context));
  }

  error(message: string, trace?: string, context?: string) {
    console.error(this.formatMessage('error', message, context));
    if (trace) {
      console.error('Stack trace:', trace);
    }
  }

  warn(message: string, context?: string) {
    console.warn(this.formatMessage('warn', message, context));
  }

  debug(message: string, context?: string) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  verbose(message: string, context?: string) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(this.formatMessage('verbose', message, context));
    }
  }
}
