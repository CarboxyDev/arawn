import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(() => {
    service = new UsersService();
    controller = new UsersController(service);
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
      service.createUser({
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      });

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

  describe('getUserById', () => {
    it('should return user by ID', () => {
      const created = service.createUser({
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      });

      const result = controller.getUserById({ id: created.id });

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('data');
      expect(result.data).toEqual(created);
    });

    it('should call service getUserById method', () => {
      const created = service.createUser({
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      });
      const spy = vi.spyOn(service, 'getUserById');

      controller.getUserById({ id: created.id });

      expect(spy).toHaveBeenCalledOnce();
      expect(spy).toHaveBeenCalledWith(created.id);
    });
  });

  describe('createUser', () => {
    it('should create a new user and return API response', () => {
      const createUserDto = {
        email: 'newuser@example.com',
        name: 'New User',
        role: 'user' as const,
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
        role: 'user' as const,
      };

      expect(() => controller.createUser(createUserDto)).not.toThrow();
    });

    it('should call service createUser method', () => {
      const spy = vi.spyOn(service, 'createUser');
      const createUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        role: 'user' as const,
      };

      controller.createUser(createUserDto);

      expect(spy).toHaveBeenCalledOnce();
      expect(spy).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('updateUser', () => {
    it('should update user and return API response', () => {
      const created = service.createUser({
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      });

      const updateUserDto = {
        name: 'Updated Name',
      };

      const result = controller.updateUser({ id: created.id }, updateUserDto);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('message', 'User updated successfully');
      expect(result).toHaveProperty('data');
      expect(result.data).toHaveProperty('name', 'Updated Name');
    });

    it('should call service updateUser method', () => {
      const created = service.createUser({
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      });
      const spy = vi.spyOn(service, 'updateUser');
      const updateUserDto = { name: 'Updated Name' };

      controller.updateUser({ id: created.id }, updateUserDto);

      expect(spy).toHaveBeenCalledOnce();
      expect(spy).toHaveBeenCalledWith(created.id, updateUserDto);
    });
  });

  describe('deleteUser', () => {
    it('should delete user and return API response', () => {
      const created = service.createUser({
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      });

      const result = controller.deleteUser({ id: created.id });

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('message', 'User deleted successfully');
    });

    it('should call service deleteUser method', () => {
      const created = service.createUser({
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      });
      const spy = vi.spyOn(service, 'deleteUser');

      controller.deleteUser({ id: created.id });

      expect(spy).toHaveBeenCalledOnce();
      expect(spy).toHaveBeenCalledWith(created.id);
    });
  });
});
