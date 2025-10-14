import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it } from 'vitest';

import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(() => {
    service = new UsersService();
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

    it('should sort users by name ascending', () => {
      service.createUser({ email: 'charlie@test.com', name: 'Charlie' });
      service.createUser({ email: 'alice@test.com', name: 'Alice' });
      service.createUser({ email: 'bob@test.com', name: 'Bob' });

      const result = service.getUsers({
        ...defaultQuery,
        sortBy: 'name',
        sortOrder: 'asc',
      });

      expect(result.data[0].name).toBe('Alice');
      expect(result.data[1].name).toBe('Bob');
      expect(result.data[2].name).toBe('Charlie');
    });
  });

  describe('getUserById', () => {
    it('should return user by ID', () => {
      const created = service.createUser({
        email: 'test@example.com',
        name: 'Test User',
      });

      const user = service.getUserById(created.id);

      expect(user).toEqual(created);
      expect(user.id).toBe(created.id);
    });

    it('should throw NotFoundException when user not found', () => {
      expect(() => service.getUserById('non-existent-id')).toThrow(
        NotFoundException
      );
      expect(() => service.getUserById('non-existent-id')).toThrow(
        'User with ID non-existent-id not found'
      );
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

  describe('updateUser', () => {
    it('should update user successfully', () => {
      const created = service.createUser({
        email: 'test@example.com',
        name: 'Test User',
      });

      const updated = service.updateUser(created.id, {
        name: 'Updated Name',
      });

      expect(updated.id).toBe(created.id);
      expect(updated.name).toBe('Updated Name');
      expect(updated.email).toBe(created.email);
      expect(updated).toHaveProperty('updatedAt');
    });

    it('should throw NotFoundException when user not found', () => {
      expect(() =>
        service.updateUser('non-existent-id', { name: 'New Name' })
      ).toThrow(NotFoundException);
    });

    it('should partially update user fields', () => {
      const created = service.createUser({
        email: 'test@example.com',
        name: 'Test User',
      });

      const updated = service.updateUser(created.id, {
        email: 'newemail@example.com',
      });

      expect(updated.name).toBe(created.name);
      expect(updated.email).toBe('newemail@example.com');
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', () => {
      const created = service.createUser({
        email: 'test@example.com',
        name: 'Test User',
      });

      service.deleteUser(created.id);

      expect(() => service.getUserById(created.id)).toThrow(NotFoundException);
    });

    it('should throw NotFoundException when user not found', () => {
      expect(() => service.deleteUser('non-existent-id')).toThrow(
        NotFoundException
      );
    });

    it('should reduce total user count after deletion', () => {
      service.createUser({ email: 'user1@test.com', name: 'User 1' });
      const user2 = service.createUser({
        email: 'user2@test.com',
        name: 'User 2',
      });

      service.deleteUser(user2.id);

      const result = service.getUsers({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });
  });
});
