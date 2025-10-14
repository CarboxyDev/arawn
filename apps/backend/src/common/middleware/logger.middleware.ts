import { Injectable, NestMiddleware } from '@nestjs/common';
import { loadEnv } from '@repo/shared-config';
import type { NextFunction, Request, Response } from 'express';

import { AsyncContextService } from '@/common/async-context';
import { LoggerService } from '@/common/logger.service';

/**
 * HTTP request/response logger middleware
 *
 * Features:
 * - Logs all HTTP requests with method, path, status, duration
 * - Respects global LOG_LEVEL and verbosity settings
 * - Sanitizes sensitive data (passwords, tokens)
 * - Includes request ID from async context
 * - Different verbosity levels show different details:
 *   - minimal: Only 4xx/5xx errors
 *   - normal: All requests (default)
 *   - detailed: Include query params, user agent
 *   - verbose: Include request/response bodies (sanitized)
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger: LoggerService;
  private readonly logLevel: string;

  constructor() {
    this.logger = new LoggerService();
    this.logger.setContext('HTTP');
    const env = loadEnv();
    this.logLevel = env.LOG_LEVEL;
  }

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, body, query } = req;
    const start = Date.now();
    const requestId = AsyncContextService.getRequestId();

    res.on('finish', () => {
      const duration = Date.now() - start;
      const { statusCode } = res;
      const userAgent = req.get('user-agent') || 'unknown';

      const isError = statusCode >= 400;
      const isSlow = duration > 1000;

      const baseContext = {
        method,
        path: originalUrl,
        statusCode,
        duration,
        requestId,
      };

      if (this.logLevel === 'minimal') {
        if (isError) {
          this.logger.warn(
            `${method} ${originalUrl} ${statusCode} ${duration}ms`,
            baseContext
          );
        }
        return;
      }

      if (this.logLevel === 'detailed' || this.logLevel === 'verbose') {
        Object.assign(baseContext, {
          userAgent,
          ...(Object.keys(query).length > 0 && { query: this.sanitize(query) }),
        });
      }

      if (this.logLevel === 'verbose') {
        Object.assign(baseContext, {
          body: this.sanitize(body),
        });
      }

      if (isError) {
        this.logger.error(
          `${method} ${originalUrl} ${statusCode} ${duration}ms`,
          undefined,
          baseContext
        );
      } else if (isSlow) {
        this.logger.warn(
          `${method} ${originalUrl} ${statusCode} ${duration}ms (SLOW)`,
          baseContext
        );
      } else {
        this.logger.http(
          `${method} ${originalUrl} ${statusCode} ${duration}ms`,
          baseContext
        );
      }
    });

    next();
  }

  /**
   * Sanitize sensitive data from logs
   */
  private sanitize(obj: unknown): unknown {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const sensitiveKeys = [
      'password',
      'token',
      'secret',
      'authorization',
      'cookie',
      'api_key',
      'apiKey',
      'accessToken',
      'refreshToken',
    ];

    const sanitized = Array.isArray(obj) ? [...obj] : { ...obj };

    for (const key in sanitized) {
      if (
        sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive))
      ) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = this.sanitize(sanitized[key]);
      }
    }

    return sanitized;
  }
}
