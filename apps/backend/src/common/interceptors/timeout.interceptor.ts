/**
 * Timeout Interceptor
 *
 * Automatically timeout requests that take too long.
 * Prevents hanging requests and resource exhaustion.
 */

// import {
//   CallHandler,
//   ExecutionContext,
//   Injectable,
//   NestInterceptor,
//   RequestTimeoutException,
// } from '@nestjs/common';
// import { Observable, throwError, TimeoutError } from 'rxjs';
// import { catchError, timeout } from 'rxjs/operators';
//
// @Injectable()
// export class TimeoutInterceptor implements NestInterceptor {
//   constructor(private readonly timeoutMs: number = 30000) {}
//
//   intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
//     return next.handle().pipe(
//       timeout(this.timeoutMs),
//       catchError((err) => {
//         if (err instanceof TimeoutError) {
//           return throwError(() => new RequestTimeoutException('Request timeout'));
//         }
//         return throwError(() => err);
//       })
//     );
//   }
// }
