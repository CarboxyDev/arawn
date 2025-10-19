import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LoggerService } from '@/common/logger.service';
import { PrismaService } from '@/database/prisma/prisma.service';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;
  let prismaService: PrismaService;
  let loggerService: LoggerService;

  const mockUser = {
    id: '550e8400-e29b-41d4-a716-446655440000',
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
    controller = new UsersController(service);
  });

  describe('getUsers', () => {
    const defaultQuery = {
      page: 1,
      limit: 10,
      sortBy: 'createdAt' as const,
      sortOrder: 'desc' as const,
    };

    it('should return paginated API response with empty users array', async () => {
      vi.mocked(prismaService.user.findMany).mockResolvedValue([]);
      vi.mocked(prismaService.user.count).mockResolvedValue(0);

      const result = await controller.getUsers(defaultQuery);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });

    it('should return paginated users from service', async () => {
      vi.mocked(prismaService.user.findMany).mockResolvedValue([mockUser]);
      vi.mocked(prismaService.user.count).mockResolvedValue(1);

      const result = await controller.getUsers(defaultQuery);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0]).toHaveProperty('email', 'test@example.com');
      expect(result.pagination.total).toBe(1);
    });

    it('should call service getUsers method with query params', async () => {
      vi.mocked(prismaService.user.findMany).mockResolvedValue([]);
      vi.mocked(prismaService.user.count).mockResolvedValue(0);
      const spy = vi.spyOn(service, 'getUsers');
      await controller.getUsers(defaultQuery);

      expect(spy).toHaveBeenCalledOnce();
      expect(spy).toHaveBeenCalledWith(defaultQuery);
    });
  });

  describe('getUserById', () => {
    it('should return user by ID', async () => {
      vi.mocked(prismaService.user.findUnique).mockResolvedValue(mockUser);

      const result = await controller.getUserById({
        id: '550e8400-e29b-41d4-a716-446655440000',
      });

      expect(result).toEqual(mockUser);
    });

    it('should call service getUserById method', async () => {
      vi.mocked(prismaService.user.findUnique).mockResolvedValue(mockUser);
      const spy = vi.spyOn(service, 'getUserById');

      await controller.getUserById({
        id: '550e8400-e29b-41d4-a716-446655440000',
      });

      expect(spy).toHaveBeenCalledOnce();
      expect(spy).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000');
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        email: 'newuser@example.com',
        name: 'New User',
        role: 'user' as const,
      };

      vi.mocked(prismaService.user.create).mockResolvedValue(mockUser);

      const result = await controller.createUser(createUserDto);

      expect(result).toEqual(mockUser);
    });

    it('should call service createUser method', async () => {
      const createUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        role: 'user' as const,
      };

      vi.mocked(prismaService.user.create).mockResolvedValue(mockUser);
      const spy = vi.spyOn(service, 'createUser');

      await controller.createUser(createUserDto);

      expect(spy).toHaveBeenCalledOnce();
      expect(spy).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('updateUser', () => {
    it('should update user', async () => {
      const updateUserDto = {
        name: 'Updated Name',
      };

      const updatedUser = { ...mockUser, name: 'Updated Name' };
      vi.mocked(prismaService.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(prismaService.user.update).mockResolvedValue(updatedUser);

      const result = await controller.updateUser(
        { id: '550e8400-e29b-41d4-a716-446655440000' },
        updateUserDto
      );

      expect(result.name).toBe('Updated Name');
    });

    it('should call service updateUser method', async () => {
      const updateUserDto = { name: 'Updated Name' };
      const updatedUser = { ...mockUser, name: 'Updated Name' };

      vi.mocked(prismaService.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(prismaService.user.update).mockResolvedValue(updatedUser);
      const spy = vi.spyOn(service, 'updateUser');

      await controller.updateUser(
        { id: '550e8400-e29b-41d4-a716-446655440000' },
        updateUserDto
      );

      expect(spy).toHaveBeenCalledOnce();
      expect(spy).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440000',
        updateUserDto
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete user', async () => {
      vi.mocked(prismaService.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(prismaService.user.delete).mockResolvedValue(mockUser);

      await controller.deleteUser({
        id: '550e8400-e29b-41d4-a716-446655440000',
      });

      expect(prismaService.user.delete).toHaveBeenCalled();
    });

    it('should call service deleteUser method', async () => {
      vi.mocked(prismaService.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(prismaService.user.delete).mockResolvedValue(mockUser);
      const spy = vi.spyOn(service, 'deleteUser');

      await controller.deleteUser({
        id: '550e8400-e29b-41d4-a716-446655440000',
      });

      expect(spy).toHaveBeenCalledOnce();
      expect(spy).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000');
    });
  });
});
