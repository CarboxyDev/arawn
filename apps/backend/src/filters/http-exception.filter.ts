import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { ZodError } from 'zod';

import { AsyncContextService } from '@/common/async-context';
import { LoggerService } from '@/common/logger.service';

/**
 * Global exception filter for comprehensive error handling
 *
 * Handles:
 * - Zod validation errors (400)
 * - Rate limiting (429)
 * - HTTP exceptions (various status codes)
 * - Unknown errors (500)
 *
 * Features:
 * - Environment-aware responses (dev shows stack traces, prod hides them)
 * - Request ID tracking for traceability
 * - Structured error logging with proper Error serialization
 * - Structured error responses matching ApiResponse type
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger: LoggerService;
  private readonly isDevelopment = process.env.NODE_ENV === 'development';

  constructor() {
    this.logger = new LoggerService();
    this.logger.setContext('ExceptionFilter');
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { method, url } = request;
    const requestId = AsyncContextService.getRequestId();
    const userAgent = request.get('user-agent') || 'unknown';

    const baseLogContext = {
      method,
      path: url,
      requestId,
      userAgent,
    };

    // Handle Zod validation errors (400 Bad Request)
    if (exception instanceof ZodError) {
      this.logger.minimal().warn('Validation failed', {
        ...baseLogContext,
        errors: exception.issues,
      });

      return response.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Validation failed',
        errors: exception.issues.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code,
        })),
        ...(this.isDevelopment && { timestamp: new Date().toISOString() }),
        ...(requestId && { requestId }),
      });
    }

    // Handle rate limiting (429 Too Many Requests)
    if (exception instanceof ThrottlerException) {
      this.logger.minimal().warn('Rate limit exceeded', baseLogContext);

      return response
        .status(HttpStatus.TOO_MANY_REQUESTS)
        .header('Retry-After', '60')
        .json({
          success: false,
          message: 'Too many requests, please try again later',
          ...(this.isDevelopment && { timestamp: new Date().toISOString() }),
          ...(requestId && { requestId }),
        });
    }

    // Handle NestJS HTTP exceptions (404, 403, etc.)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (status >= 500) {
        this.logger
          .minimal()
          .error(`HTTP ${status} error`, exception, baseLogContext);
      } else {
        this.logger.minimal().warn(`HTTP ${status}`, {
          ...baseLogContext,
          status,
        });
      }

      return response.status(status).json({
        success: false,
        message:
          typeof exceptionResponse === 'string'
            ? exceptionResponse
            : (exceptionResponse as { message?: string }).message ||
              'An error occurred',
        ...(typeof exceptionResponse === 'object' && exceptionResponse),
        ...(this.isDevelopment && {
          timestamp: new Date().toISOString(),
          path: url,
        }),
        ...(requestId && { requestId }),
      });
    }

    // Handle unknown errors (500 Internal Server Error)
    const error =
      exception instanceof Error ? exception : new Error(String(exception));

    this.logger.minimal().error('Unhandled exception', error, baseLogContext);

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: this.isDevelopment ? error.message : 'Internal server error',
      ...(this.isDevelopment && {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        path: url,
      }),
      ...(requestId && { requestId }),
    });
  }
}
