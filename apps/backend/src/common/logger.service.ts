import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import pino, { type Logger } from 'pino';

import { AsyncContextService } from '@/common/async-context';
import { loadEnv } from '@/config/env';

type VerbosityLevel = 'minimal' | 'normal' | 'detailed' | 'verbose';
type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'http';

interface LogContext {
  [key: string]: unknown;
}

/**
 * Production-ready logger service using Pino with structured logging
 *
 * Features:
 * - Fluent verbosity API: logger.verbose().debug(...)
 * - Global LOG_LEVEL configuration with per-call overrides
 * - Request ID tracking via AsyncLocalStorage
 * - Environment-aware output (pretty dev, JSON prod)
 * - Proper error serialization
 * - Child logger support for context inheritance
 *
 * Usage:
 * ```typescript
 * // Normal usage (respects global LOG_LEVEL)
 * logger.info('User created', { userId: 123 });
 * logger.error('Payment failed', { error, orderId });
 *
 * // Explicit verbosity (overrides global)
 * logger.verbose().debug('SQL query executed', { query, duration });
 * logger.minimal().http('GET /health');
 * ```
 */
@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger: Logger;
  private readonly globalVerbosity: VerbosityLevel;
  private readonly isDevelopment: boolean;
  private verbosityOverride?: VerbosityLevel;
  private context?: string;

  constructor() {
    const env = loadEnv();
    this.isDevelopment = env.NODE_ENV === 'development';
    this.globalVerbosity = env.LOG_LEVEL;

    this.logger = pino({
      level: 'trace',
      formatters: {
        level: (label) => ({ level: label }),
      },
      serializers: {
        err: pino.stdSerializers.err,
        error: pino.stdSerializers.err,
        req: pino.stdSerializers.req,
        res: pino.stdSerializers.res,
      },
      transport: this.isDevelopment
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              ignore: 'pid,hostname',
              singleLine: false,
              messageFormat: '{if context}[{context}] {end}{msg}',
              translateTime: 'HH:MM:ss',
            },
          }
        : undefined,
    });
  }

  /**
   * Set verbosity to minimal (only critical errors and warnings)
   */
  minimal(): this {
    const instance = this.clone();
    instance.verbosityOverride = 'minimal';
    return instance;
  }

  /**
   * Set verbosity to normal (standard operations and errors)
   */
  normal(): this {
    const instance = this.clone();
    instance.verbosityOverride = 'normal';
    return instance;
  }

  /**
   * Set verbosity to detailed (include debug info, queries, etc.)
   */
  detailed(): this {
    const instance = this.clone();
    instance.verbosityOverride = 'detailed';
    return instance;
  }

  /**
   * Set verbosity to verbose (everything including bodies, timings)
   */
  verbose(): this {
    const instance = this.clone();
    instance.verbosityOverride = 'verbose';
    return instance;
  }

  /**
   * Set context for this logger instance
   */
  setContext(context: string): void {
    this.context = context;
  }

  /**
   * Create a child logger with specific context
   */
  child(context: string): LoggerService {
    const instance = this.clone();
    instance.context = context;
    return instance;
  }

  /**
   * Log info level message
   */
  log(message: string, context?: LogContext): void {
    this.info(message, context);
  }

  /**
   * Log info level message
   */
  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      this.writeLog('info', message, context);
    }
  }

  /**
   * Log error level message
   */
  error(message: string, error?: Error | string, context?: LogContext): void {
    if (this.shouldLog('error')) {
      const errorContext =
        error instanceof Error
          ? { err: error, ...context }
          : error
            ? { trace: error, ...context }
            : context;

      this.writeLog('error', message, errorContext);
    }
  }

  /**
   * Log warning level message
   */
  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      this.writeLog('warn', message, context);
    }
  }

  /**
   * Log debug level message
   */
  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      this.writeLog('debug', message, context);
    }
  }

  /**
   * Log HTTP request/response
   */
  http(message: string, context?: LogContext): void {
    if (this.shouldLog('http')) {
      this.writeLog('info', message, context);
    }
  }

  /**
   * Determine if a log should be written based on verbosity settings
   */
  private shouldLog(level: LogLevel): boolean {
    const effectiveVerbosity = this.verbosityOverride ?? this.globalVerbosity;

    const verbosityOrder: VerbosityLevel[] = [
      'minimal',
      'normal',
      'detailed',
      'verbose',
    ];
    const currentLevel =
      verbosityOrder.indexOf(effectiveVerbosity) >= 0
        ? verbosityOrder.indexOf(effectiveVerbosity)
        : 1;

    switch (level) {
      case 'error':
      case 'warn':
        return currentLevel >= 0;
      case 'info':
      case 'http':
        return currentLevel >= 1;
      case 'debug':
        return currentLevel >= 2;
      default:
        return false;
    }
  }

  /**
   * Write log to Pino with context and request ID
   */
  private writeLog(
    level: 'info' | 'error' | 'warn' | 'debug',
    message: string,
    context?: LogContext
  ): void {
    const requestId = AsyncContextService.getRequestId();
    const enrichedContext: LogContext = {
      ...(this.context && { context: this.context }),
      ...(requestId && { reqId: requestId }),
      ...context,
    };

    this.logger[level](enrichedContext, message);
  }

  /**
   * Clone this logger instance (for fluent API)
   */
  private clone(): this {
    const instance = Object.create(Object.getPrototypeOf(this));
    instance.logger = this.logger;
    instance.globalVerbosity = this.globalVerbosity;
    instance.isDevelopment = this.isDevelopment;
    instance.context = this.context;
    instance.verbosityOverride = this.verbosityOverride;
    return instance;
  }
}
