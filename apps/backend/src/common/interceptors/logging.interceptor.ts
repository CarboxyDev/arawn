/**
 * Logging Interceptor
 *
 * Logs request processing time and response status.
 * NOTE: You already have LoggerMiddleware - this is optional for additional timing info.
 */

// import {
//   CallHandler,
//   ExecutionContext,
//   Injectable,
//   NestInterceptor,
// } from '@nestjs/common';
// import type { Request, Response } from 'express';
// import { Observable } from 'rxjs';
// import { tap } from 'rxjs/operators';
//
// import { AsyncContextService } from '@/common/async-context';
// import { LoggerService } from '@/common/logger.service';
//
// @Injectable()
// export class LoggingInterceptor implements NestInterceptor {
//   private readonly logger = new LoggerService();
//
//   constructor() {
//     this.logger.setContext('LoggingInterceptor');
//   }
//
//   intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
//     const request = context.switchToHttp().getRequest<Request>();
//     const response = context.switchToHttp().getResponse<Response>();
//     const { method, url } = request;
//     const requestId = AsyncContextService.getRequestId();
//     const startTime = Date.now();
//
//     return next.handle().pipe(
//       tap({
//         next: () => {
//           const duration = Date.now() - startTime;
//           this.logger.detailed().http('Request completed', {
//             method,
//             path: url,
//             statusCode: response.statusCode,
//             duration: `${duration}ms`,
//             requestId,
//           });
//         },
//         error: (error) => {
//           const duration = Date.now() - startTime;
//           this.logger.error('Request failed', error, {
//             method,
//             path: url,
//             duration: `${duration}ms`,
//             requestId,
//           });
//         },
//       })
//     );
//   }
// }
