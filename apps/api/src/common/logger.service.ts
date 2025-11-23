import type { FastifyBaseLogger } from 'fastify';
import pino, { type Logger } from 'pino';

import { loadEnv } from '@/config/env';

type VerbosityLevel = 'minimal' | 'normal' | 'detailed' | 'verbose';
type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace';

interface LogContext {
  [key: string]: unknown;
}

interface PerformanceMetrics {
  operation: string;
  duration: number;
  [key: string]: unknown;
}

export class LoggerService {
  private readonly logger: Logger | FastifyBaseLogger;
  private readonly globalVerbosity: VerbosityLevel;
  private readonly isDevelopment: boolean;
  private verbosityOverride?: VerbosityLevel;
  private context?: string;

  constructor(existingLogger?: Logger | FastifyBaseLogger) {
    const env = loadEnv();
    this.isDevelopment = env.NODE_ENV === 'development';
    this.globalVerbosity = env.LOG_LEVEL;

    if (existingLogger) {
      this.logger = existingLogger;
    } else {
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
  }

  minimal(): this {
    const instance = this.clone();
    instance.verbosityOverride = 'minimal';
    return instance;
  }

  normal(): this {
    const instance = this.clone();
    instance.verbosityOverride = 'normal';
    return instance;
  }

  detailed(): this {
    const instance = this.clone();
    instance.verbosityOverride = 'detailed';
    return instance;
  }

  verbose(): this {
    const instance = this.clone();
    instance.verbosityOverride = 'verbose';
    return instance;
  }

  setContext(context: string): void {
    this.context = context;
  }

  child(context: string): LoggerService {
    const instance = this.clone();
    instance.context = context;
    return instance;
  }

  log(message: string, context?: LogContext): void {
    this.info(message, context);
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      this.writeLog('info', message, context);
    }
  }

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

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      this.writeLog('warn', message, context);
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      this.writeLog('debug', message, context);
    }
  }

  trace(message: string, context?: LogContext): void {
    if (this.shouldLog('trace')) {
      this.writeLog('trace', message, context);
    }
  }

  perf(message: string, metrics: PerformanceMetrics): void {
    if (this.shouldLog('debug')) {
      this.writeLog('debug', message, {
        performance: true,
        ...metrics,
      });
    }
  }

  getVerbosity(): VerbosityLevel {
    return this.verbosityOverride ?? this.globalVerbosity;
  }

  getRawLogger(): Logger | FastifyBaseLogger {
    return this.logger;
  }

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
        return currentLevel >= 1;
      case 'debug':
        return currentLevel >= 2;
      case 'trace':
        return currentLevel >= 3;
      default:
        return false;
    }
  }

  private writeLog(
    level: 'info' | 'error' | 'warn' | 'debug' | 'trace',
    message: string,
    context?: LogContext
  ): void {
    const effectiveVerbosity = this.verbosityOverride ?? this.globalVerbosity;
    const enrichedContext: LogContext = {};

    if (effectiveVerbosity === 'minimal') {
      // Minimal: message only + critical error fields
      if (context?.err) enrichedContext.err = context.err;
      if (context?.error) enrichedContext.error = context.error;
    } else if (effectiveVerbosity === 'normal') {
      // Normal: [context] + message + error fields (no additional fields)
      if (this.context) {
        enrichedContext.context = this.context;
      }
      if (context?.err) enrichedContext.err = context.err;
      if (context?.error) enrichedContext.error = context.error;
      if (context?.trace) enrichedContext.trace = context.trace;
    } else {
      // Detailed & Verbose: [context] + message + all fields
      if (this.context) {
        enrichedContext.context = this.context;
      }
      if (context) {
        Object.assign(enrichedContext, context);
      }
    }

    (this.logger[level] as (obj: object, msg?: string) => void)(
      enrichedContext,
      message
    );
  }

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
