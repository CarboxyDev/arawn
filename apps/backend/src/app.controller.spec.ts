import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;
  let service: AppService;

  beforeEach(() => {
    service = new AppService();
    controller = new AppController(service);
  });

  describe('getHealth', () => {
    it('should return health check data', () => {
      const result = controller.getHealth();

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('version', '1.0.0');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('environment');
    });

    it('should call service getHealth method', () => {
      const spy = vi.spyOn(service, 'getHealth');
      controller.getHealth();

      expect(spy).toHaveBeenCalledOnce();
    });
  });

  describe('getHello', () => {
    it('should return API response with greeting', () => {
      const result = controller.getHello();

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('message', 'Welcome to Arawn Monorepo API');
      expect(result).toHaveProperty('data', 'Hello from Arawn Backend!');
    });

    it('should call service getHello method', () => {
      const spy = vi.spyOn(service, 'getHello');
      controller.getHello();

      expect(spy).toHaveBeenCalledOnce();
    });
  });
});
