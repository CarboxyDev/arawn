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

  describe('getUsers', () => {
    const defaultQuery = {
      page: 1,
      limit: 10,
      sortBy: 'createdAt' as const,
      sortOrder: 'desc' as const,
    };

    it('should return empty paginated response initially', () => {
      const result = service.getUsers(defaultQuery);
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });

    it('should return paginated users', () => {
      service.createUser({ email: 'user1@test.com', name: 'User 1' });
      service.createUser({ email: 'user2@test.com', name: 'User 2' });

      const result = service.getUsers(defaultQuery);
      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('should filter users by search query', () => {
      service.createUser({ email: 'john@test.com', name: 'John Doe' });
      service.createUser({ email: 'jane@test.com', name: 'Jane Smith' });

      const result = service.getUsers({ ...defaultQuery, search: 'john' });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('John Doe');
    });

    it('should handle pagination correctly', () => {
      service.createUser({ email: 'user1@test.com', name: 'User 1' });
      service.createUser({ email: 'user2@test.com', name: 'User 2' });
      service.createUser({ email: 'user3@test.com', name: 'User 3' });

      const result = service.getUsers({ ...defaultQuery, page: 1, limit: 2 });
      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.totalPages).toBe(2);
    });
  });

  describe('createUser', () => {
    it('should create a new user with generated ID', () => {
      const createUser = {
        email: 'test@example.com',
        name: 'Test User',
      };

      const user = service.createUser(createUser);

      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email', createUser.email);
      expect(user).toHaveProperty('name', createUser.name);
      expect(user).toHaveProperty('createdAt');
      expect(user).toHaveProperty('updatedAt');
    });

    it('should generate unique UUIDs for different users', () => {
      const user1 = service.createUser({
        email: 'user1@test.com',
        name: 'User 1',
      });
      const user2 = service.createUser({
        email: 'user2@test.com',
        name: 'User 2',
      });

      expect(user1.id).not.toBe(user2.id);
    });

    it('should store created users', () => {
      const createUser = {
        email: 'test@example.com',
        name: 'Test User',
      };

      service.createUser(createUser);
      const result = service.getUsers({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].email).toBe(createUser.email);
    });

    it('should set timestamps as ISO strings', () => {
      const user = service.createUser({
        email: 'test@example.com',
        name: 'Test User',
      });

      expect(typeof user.createdAt).toBe('string');
      expect(typeof user.updatedAt).toBe('string');
      expect(new Date(user.createdAt).toISOString()).toBe(user.createdAt);
      expect(new Date(user.updatedAt).toISOString()).toBe(user.updatedAt);
    });
  });
});
