import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LoggerService } from '@/common/logger.service';
import { PrismaService } from '@/database/prisma/prisma.service';

import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;
  let loggerService: LoggerService;

  beforeEach(() => {
    loggerService = {
      setContext: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      child: vi.fn(() => loggerService),
    } as unknown as LoggerService;

    prismaService = {
      user: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    } as unknown as PrismaService;

    service = new UsersService(prismaService, loggerService);
  });

  describe('getUsers', () => {
    const defaultQuery = {
      page: 1,
      limit: 10,
      sortBy: 'createdAt' as const,
      sortOrder: 'desc' as const,
    };

    const mockUsers = [
      {
        id: '1',
        email: 'user1@test.com',
        name: 'User 1',
        emailVerified: false,
        image: null,
        role: 'user' as const,
        banned: false,
        banReason: null,
        banExpires: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        email: 'user2@test.com',
        name: 'User 2',
        emailVerified: false,
        image: null,
        role: 'user' as const,
        banned: false,
        banReason: null,
        banExpires: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should return empty paginated response initially', async () => {
      vi.mocked(prismaService.user.findMany).mockResolvedValue([]);
      vi.mocked(prismaService.user.count).mockResolvedValue(0);

      const result = await service.getUsers(defaultQuery);
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });

    it('should return paginated users', async () => {
      vi.mocked(prismaService.user.findMany).mockResolvedValue(mockUsers);
      vi.mocked(prismaService.user.count).mockResolvedValue(2);

      const result = await service.getUsers(defaultQuery);
      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('should handle pagination correctly', async () => {
      vi.mocked(prismaService.user.findMany).mockResolvedValue([mockUsers[0]]);
      vi.mocked(prismaService.user.count).mockResolvedValue(3);

      const result = await service.getUsers({
        ...defaultQuery,
        page: 1,
        limit: 2,
      });
      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.totalPages).toBe(2);
    });

    it('should filter users by search query', async () => {
      vi.mocked(prismaService.user.findMany).mockResolvedValue([mockUsers[0]]);
      vi.mocked(prismaService.user.count).mockResolvedValue(1);

      const result = await service.getUsers({
        ...defaultQuery,
        search: 'user1',
      });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].email).toBe('user1@test.com');
    });
  });

  describe('getUserById', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      emailVerified: false,
      image: null,
      role: 'user' as const,
      banned: false,
      banReason: null,
      banExpires: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return user by ID', async () => {
      vi.mocked(prismaService.user.findUnique).mockResolvedValue(mockUser);

      const user = await service.getUserById('1');

      expect(user).toEqual(mockUser);
      expect(user.id).toBe('1');
    });

    it('should throw NotFoundException when user not found', async () => {
      vi.mocked(prismaService.user.findUnique).mockResolvedValue(null);

      await expect(service.getUserById('non-existent-id')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('createUser', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      emailVerified: false,
      image: null,
      role: 'user' as const,
      banned: false,
      banReason: null,
      banExpires: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a new user', async () => {
      vi.mocked(prismaService.user.create).mockResolvedValue(mockUser);

      const user = await service.createUser({
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      });

      expect(user.id).toBe('1');
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
    });
  });

  describe('updateUser', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      emailVerified: false,
      image: null,
      role: 'user' as const,
      banned: false,
      banReason: null,
      banExpires: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedUser = {
      ...mockUser,
      name: 'Updated Name',
    };

    it('should update user successfully', async () => {
      vi.mocked(prismaService.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(prismaService.user.update).mockResolvedValue(updatedUser);

      const user = await service.updateUser('1', { name: 'Updated Name' });

      expect(user.name).toBe('Updated Name');
      expect(user.id).toBe('1');
    });

    it('should throw NotFoundException when user not found', async () => {
      vi.mocked(prismaService.user.findUnique).mockResolvedValue(null);

      await expect(
        service.updateUser('non-existent-id', { name: 'New Name' })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUser', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      emailVerified: false,
      image: null,
      role: 'user' as const,
      banned: false,
      banReason: null,
      banExpires: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should delete user successfully', async () => {
      vi.mocked(prismaService.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(prismaService.user.delete).mockResolvedValue(mockUser);

      await service.deleteUser('1');

      expect(prismaService.user.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      vi.mocked(prismaService.user.findUnique).mockResolvedValue(null);

      await expect(service.deleteUser('non-existent-id')).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
