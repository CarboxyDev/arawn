import { beforeEach, describe, expect, it } from 'vitest';

import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(() => {
    service = new AppService();
  });

  describe('getHealth', () => {
    it('should return health check information', () => {
      const health = service.getHealth();

      expect(health).toHaveProperty('status', 'ok');
      expect(health).toHaveProperty('version', '1.0.0');
      expect(health).toHaveProperty('timestamp');
      expect(health).toHaveProperty('uptime');
      expect(health).toHaveProperty('environment');
      expect(typeof health.uptime).toBe('number');
      expect(health.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should have valid ISO timestamp', () => {
      const health = service.getHealth();
      const timestamp = new Date(health.timestamp);

      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.toISOString()).toBe(health.timestamp);
    });

    it('should return test environment', () => {
      const health = service.getHealth();
      expect(health.environment).toBe('test');
    });
  });

  describe('getHello', () => {
    it('should return greeting message', () => {
      const message = service.getHello();
      expect(message).toBe('Hello from Arawn Backend!');
    });
  });
});
