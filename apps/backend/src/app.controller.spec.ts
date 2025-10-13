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

  describe('getUsers', () => {
    const defaultQuery = {
      page: 1,
      limit: 10,
      sortBy: 'createdAt' as const,
      sortOrder: 'desc' as const,
    };

    it('should return paginated API response with empty users array', () => {
      const result = controller.getUsers(defaultQuery);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });

    it('should return paginated users from service', () => {
      service.createUser({ email: 'test@example.com', name: 'Test User' });

      const result = controller.getUsers(defaultQuery);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0]).toHaveProperty('email', 'test@example.com');
      expect(result.pagination.total).toBe(1);
    });

    it('should call service getUsers method with query params', () => {
      const spy = vi.spyOn(service, 'getUsers');
      controller.getUsers(defaultQuery);

      expect(spy).toHaveBeenCalledOnce();
      expect(spy).toHaveBeenCalledWith(defaultQuery);
    });
  });

  describe('createUser', () => {
    it('should create a new user and return API response', () => {
      const createUserDto = {
        email: 'newuser@example.com',
        name: 'New User',
      };

      const result = controller.createUser(createUserDto);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('message', 'User created successfully');
      expect(result).toHaveProperty('data');
      expect(result.data).toHaveProperty('id');
      expect(result.data).toHaveProperty('email', createUserDto.email);
      expect(result.data).toHaveProperty('name', createUserDto.name);
    });

    it('should validate user data with Zod schema', () => {
      const createUserDto = {
        email: 'valid@example.com',
        name: 'Valid User',
      };

      expect(() => controller.createUser(createUserDto)).not.toThrow();
    });

    it('should call service createUser method', () => {
      const spy = vi.spyOn(service, 'createUser');
      const createUserDto = {
        email: 'test@example.com',
        name: 'Test User',
      };

      controller.createUser(createUserDto);

      expect(spy).toHaveBeenCalledOnce();
      expect(spy).toHaveBeenCalledWith(createUserDto);
    });
  });
});
