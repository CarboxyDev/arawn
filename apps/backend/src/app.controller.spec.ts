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
    it('should return API response with empty users array', () => {
      const result = controller.getUsers();

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('data');
      expect(result.data).toEqual([]);
    });

    it('should return all users from service', () => {
      service.createUser({ email: 'test@example.com', name: 'Test User' });

      const result = controller.getUsers();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0]).toHaveProperty('email', 'test@example.com');
    });

    it('should call service getUsers method', () => {
      const spy = vi.spyOn(service, 'getUsers');
      controller.getUsers();

      expect(spy).toHaveBeenCalledOnce();
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

    it('should throw error for invalid email', () => {
      const invalidDto = {
        email: 'not-an-email',
        name: 'Test User',
      };

      expect(() => controller.createUser(invalidDto)).toThrow();
    });

    it('should throw error for empty name', () => {
      const invalidDto = {
        email: 'test@example.com',
        name: '',
      };

      expect(() => controller.createUser(invalidDto)).toThrow();
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
