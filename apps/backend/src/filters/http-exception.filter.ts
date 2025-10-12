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
 * - Request context logging (method, path, user-agent)
 * - Structured error responses matching ApiResponse type
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new LoggerService();
  private readonly isDevelopment = process.env.NODE_ENV === 'development';

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Extract request context for logging
    const { method, url, headers } = request;
    const userAgent = headers['user-agent'] || 'unknown';
    const requestContext = `${method} ${url} [${userAgent}]`;

    // Handle Zod validation errors (400 Bad Request)
    if (exception instanceof ZodError) {
      this.logger.warn(
        `Validation error: ${requestContext}`,
        'ExceptionFilter'
      );

      return response.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Validation failed',
        errors: exception.issues.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code,
        })),
        ...(this.isDevelopment && { timestamp: new Date().toISOString() }),
      });
    }

    // Handle rate limiting (429 Too Many Requests)
    if (exception instanceof ThrottlerException) {
      this.logger.warn(
        `Rate limit exceeded: ${requestContext}`,
        'ExceptionFilter'
      );

      return response
        .status(HttpStatus.TOO_MANY_REQUESTS)
        .header('Retry-After', '60') // Retry after 60 seconds
        .json({
          success: false,
          message: 'Too many requests, please try again later',
          ...(this.isDevelopment && { timestamp: new Date().toISOString() }),
        });
    }

    // Handle NestJS HTTP exceptions (404, 403, etc.)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // Only log 5xx errors as errors, others as warnings
      if (status >= 500) {
        this.logger.error(
          `HTTP ${status} error: ${requestContext}`,
          exception.stack,
          'ExceptionFilter'
        );
      } else {
        this.logger.warn(
          `HTTP ${status}: ${requestContext}`,
          'ExceptionFilter'
        );
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
      });
    }

    // Handle unknown errors (500 Internal Server Error)
    this.logger.error(
      `Unhandled exception: ${requestContext}`,
      exception instanceof Error ? exception.stack : String(exception),
      'ExceptionFilter'
    );

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: this.isDevelopment
        ? exception instanceof Error
          ? exception.message
          : 'Internal server error'
        : 'Internal server error',
      ...(this.isDevelopment && {
        error:
          exception instanceof Error ? exception.message : String(exception),
        stack: exception instanceof Error ? exception.stack : undefined,
        timestamp: new Date().toISOString(),
        path: url,
      }),
    });
  }
}
