import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import pino, { type Logger } from 'pino';

/**
 * Lightweight logger service using Pino
 *
 * - Pretty output in development
 * - JSON structured logs in production
 * - Minimal configuration, maximum performance
 */
@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger: Logger;

  constructor() {
    const isDev = process.env.NODE_ENV === 'development';

    this.logger = pino({
      level: isDev ? 'debug' : 'info',
      transport: isDev
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              ignore: 'pid,hostname,context',
              singleLine: true,
              messageFormat: '{context} {msg}',
            },
          }
        : undefined,
    });
  }

  log(message: string, context?: string) {
    const msg = context ? `[${context}] ${message}` : message;
    this.logger.info(msg);
  }

  error(message: string, trace?: string, context?: string) {
    const msg = context ? `[${context}] ${message}` : message;
    this.logger.error({ trace }, msg);
  }

  warn(message: string, context?: string) {
    const msg = context ? `[${context}] ${message}` : message;
    this.logger.warn(msg);
  }

  debug(message: string, context?: string) {
    const msg = context ? `[${context}] ${message}` : message;
    this.logger.debug(msg);
  }

  verbose(message: string, context?: string) {
    const msg = context ? `[${context}] ${message}` : message;
    this.logger.debug(msg);
  }
}
