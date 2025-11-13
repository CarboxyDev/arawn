import pino, { type Logger } from 'pino';

import { loadEnv } from '@/config/env';

type VerbosityLevel = 'minimal' | 'normal' | 'detailed' | 'verbose';
type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'http';

interface LogContext {
  [key: string]: unknown;
}

export class LoggerService {
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

  http(message: string, context?: LogContext): void {
    if (this.shouldLog('http')) {
      this.writeLog('info', message, context);
    }
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
      case 'http':
        return currentLevel >= 1;
      case 'debug':
        return currentLevel >= 2;
      default:
        return false;
    }
  }

  private writeLog(
    level: 'info' | 'error' | 'warn' | 'debug',
    message: string,
    context?: LogContext
  ): void {
    const enrichedContext: LogContext = {
      ...(this.context && { context: this.context }),
      ...context,
    };

    this.logger[level](enrichedContext, message);
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
