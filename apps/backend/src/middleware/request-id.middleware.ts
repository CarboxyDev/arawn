import { randomUUID } from 'node:crypto';

import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

import { AsyncContextService } from '@/common/async-context';

/**
 * Request ID middleware using AsyncLocalStorage for request tracing
 *
 * Features:
 * - Generates unique request ID for each request
 * - Preserves client-provided request ID (X-Request-ID header)
 * - Stores in async context accessible throughout request lifecycle
 * - Adds X-Request-ID to response headers
 * - Enables request tracing across services and logs
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const clientRequestId = req.headers['x-request-id'] as string | undefined;
    const requestId = clientRequestId || `req-${randomUUID()}`;

    AsyncContextService.run({ requestId }, () => {
      res.setHeader('X-Request-ID', requestId);
      next();
    });
  }
}
