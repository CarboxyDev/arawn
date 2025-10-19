import { Injectable } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { HealthCheck } from '@repo/shared-types';

@Injectable()
export class AppService {
  private readonly startTime = Date.now();

  @SkipThrottle()
  getHealth(): HealthCheck {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime,
      environment:
        (process.env.NODE_ENV as 'development' | 'staging' | 'production') ||
        'development',
    };
  }

  getHello(): string {
    return 'Hello from Arawn Backend!';
  }
}
