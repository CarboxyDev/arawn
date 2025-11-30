import { createMockAuthorizationService } from '@test/helpers/mock-authorization';
import { createMockLogger } from '@test/helpers/mock-logger';
import { getTestPrisma, resetTestDatabase } from '@test/helpers/test-db';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { LoggerService } from '@/common/logger.service';
import type { AuthorizationService } from '@/services/authorization.service';
import { UsersService } from '@/services/users.service';

/**
 * Integration tests for UsersService
 * These tests use a real PostgreSQL database (app_dev_test)
 * The database is automatically created and migrated in test/setup.ts
 */
describe('UsersService Integration Tests', () => {
  let service: UsersService;
  let logger: LoggerService;
  let authorizationService: AuthorizationService;

  beforeEach(async () => {
    // Reset database between tests
    await resetTestDatabase();

    // Create service with real Prisma client
    logger = createMockLogger();
    authorizationService = createMockAuthorizationService();
    const prisma = getTestPrisma();
    service = new UsersService(prisma, logger, authorizationService);
  });

  afterEach(async () => {
    // Additional cleanup if needed
  });

  describe('User CRUD Operations', () => {
    it('should create and retrieve a user', async () => {
      // Create user
      const createdUser = await service.createUser({
        email: 'integration@test.com',
        name: 'Integration Test User',
        role: 'user',
      });

      expect(createdUser.id).toBeDefined();
      expect(createdUser.email).toBe('integration@test.com');
      expect(createdUser.name).toBe('Integration Test User');
      expect(createdUser.role).toBe('user');

      // Retrieve user by ID
      const retrievedUser = await service.getUserById(createdUser.id);

      expect(retrievedUser).toBeDefined();
      expect(retrievedUser?.id).toBe(createdUser.id);
      expect(retrievedUser?.email).toBe('integration@test.com');
    });

    it('should update an existing user', async () => {
      // Create user
      const user = await service.createUser({
        email: 'update@test.com',
        name: 'Original Name',
        role: 'user',
      });

      // Update user
      const updatedUser = await service.updateUser(
        'actor-id',
        'super_admin',
        user.id,
        {
          name: 'Updated Name',
        }
      );

      expect(updatedUser).toBeDefined();
      expect(updatedUser?.name).toBe('Updated Name');
      expect(updatedUser?.email).toBe('update@test.com'); // Email unchanged

      // Verify update persisted
      const retrievedUser = await service.getUserById(user.id);
      expect(retrievedUser?.name).toBe('Updated Name');
    });

    it('should delete a user', async () => {
      // Create user
      const user = await service.createUser({
        email: 'delete@test.com',
        name: 'To Be Deleted',
        role: 'user',
      });

      // Delete user
      await service.deleteUser('actor-id', 'super_admin', user.id);

      // Verify user is deleted (should throw NotFoundError)
      await expect(service.getUserById(user.id)).rejects.toThrow(
        'User not found'
      );
    });

    it('should throw NotFoundError when updating non-existent user', async () => {
      await expect(
        service.updateUser('actor-id', 'super_admin', 'non-existent-id', {
          name: 'New Name',
        })
      ).rejects.toThrow('User not found');
    });

    it('should throw NotFoundError when deleting non-existent user', async () => {
      await expect(
        service.deleteUser('actor-id', 'super_admin', 'non-existent-id')
      ).rejects.toThrow('User not found');
    });
  });

  describe('User Pagination and Filtering', () => {
    beforeEach(async () => {
      // Create test users
      await service.createUser({
        email: 'alice@test.com',
        name: 'Alice Smith',
        role: 'user',
      });
      await service.createUser({
        email: 'bob@test.com',
        name: 'Bob Johnson',
        role: 'admin',
      });
      await service.createUser({
        email: 'charlie@test.com',
        name: 'Charlie Brown',
        role: 'user',
      });
    });

    it('should return paginated users', async () => {
      const result = await service.getUsers({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(result.data).toHaveLength(3);
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.totalPages).toBe(1);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });

    it('should handle pagination correctly', async () => {
      const result = await service.getUsers({
        page: 1,
        limit: 2,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.totalPages).toBe(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(2);
    });

    it('should filter users by search query', async () => {
      const result = await service.getUsers({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        search: 'alice',
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].email).toBe('alice@test.com');
    });

    it('should sort users by email', async () => {
      const result = await service.getUsers({
        page: 1,
        limit: 10,
        sortBy: 'email',
        sortOrder: 'asc',
      });

      expect(result.data[0].email).toBe('alice@test.com');
      expect(result.data[1].email).toBe('bob@test.com');
      expect(result.data[2].email).toBe('charlie@test.com');
    });
  });

  describe('Database Constraints', () => {
    it('should enforce unique email constraint', async () => {
      await service.createUser({
        email: 'unique@test.com',
        name: 'First User',
        role: 'user',
      });

      // Attempting to create another user with same email should fail
      await expect(
        service.createUser({
          email: 'unique@test.com',
          name: 'Second User',
          role: 'user',
        })
      ).rejects.toThrow();
    });
  });
});
