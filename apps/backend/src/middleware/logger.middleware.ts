import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

import { LoggerService } from '@/common/logger.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new LoggerService();

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      const { statusCode } = res;

      // Only log non-200 responses or slow requests (>500ms)
      if (statusCode !== 200 || duration > 500) {
        this.logger.log(
          `${method} ${originalUrl} ${statusCode} ${duration}ms`,
          'HTTP'
        );
      }
    });

    next();
  }
}
