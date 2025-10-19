/**
 * Transform Interceptor
 *
 * Automatically wraps successful responses in { success: true, data: ... } format.
 * Eliminates manual wrapping in controllers.
 */

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: unknown) => {
        // Skip if already wrapped
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // Wrap in standard format
        return {
          success: true,
          data,
        };
      })
    );
  }
}
