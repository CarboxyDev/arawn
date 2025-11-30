import {
  type PaginatedResponse,
  type QueryUsers,
} from '@repo/packages-types/pagination';
import { type Role } from '@repo/packages-types/role';
import {
  type CreateUser,
  type UpdateUser,
  type User,
} from '@repo/packages-types/user';
import { ForbiddenError, NotFoundError } from '@repo/packages-utils/errors';

import type { LoggerService } from '@/common/logger.service';
import type { PrismaClient } from '@/generated/client/client.js';
import type { AuthorizationService } from '@/services/authorization.service';

export class UsersService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly logger: LoggerService,
    private readonly authorizationService: AuthorizationService
  ) {
    this.logger.setContext('UsersService');
  }

  async getUsers(query: QueryUsers): Promise<PaginatedResponse<User>> {
    const where = query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' as const } },
            { email: { contains: query.search, mode: 'insensitive' as const } },
          ],
        }
      : undefined;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / query.limit);

    return {
      data: users as User[],
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
      },
    };
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      this.logger.warn('User not found', { userId: id });
      throw new NotFoundError('User not found', { userId: id });
    }

    return user as User;
  }

  async createUser(createUser: CreateUser): Promise<User> {
    this.logger.info('Creating user', { email: createUser.email });

    const user = await this.prisma.user.create({
      data: {
        email: createUser.email,
        name: createUser.name,
      },
    });

    this.logger.info('User created successfully', { userId: user.id });
    return user as User;
  }

  async updateUser(
    actorId: string,
    actorRole: Role,
    targetId: string,
    updateUser: UpdateUser
  ): Promise<User> {
    this.logger.info('Updating user', {
      actorId,
      actorRole,
      targetId,
    });

    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetId },
    });

    if (!targetUser) {
      this.logger.warn('User not found for update', { userId: targetId });
      throw new NotFoundError('User not found', { userId: targetId });
    }

    // Check if actor can modify target user
    this.authorizationService.assertCanModifyUser(
      actorId,
      actorRole,
      targetId,
      targetUser.role as Role
    );

    // Check role change permissions
    if (updateUser.role && updateUser.role !== targetUser.role) {
      this.authorizationService.assertCanChangeRole(
        actorId,
        actorRole,
        targetId,
        targetUser.role as Role,
        updateUser.role
      );
    }

    // Check email change permissions
    if (updateUser.email && updateUser.email !== targetUser.email) {
      this.authorizationService.assertCanChangeEmail(actorRole);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: targetId },
      data: updateUser,
    });

    this.logger.info('User updated successfully', {
      actorId,
      targetId,
      changes: Object.keys(updateUser),
    });
    return updatedUser as User;
  }

  async deleteUser(
    actorId: string,
    actorRole: Role,
    targetId: string
  ): Promise<void> {
    this.logger.info('Deleting user', {
      actorId,
      actorRole,
      targetId,
    });

    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetId },
    });

    if (!targetUser) {
      this.logger.warn('User not found for deletion', { userId: targetId });
      throw new NotFoundError('User not found', { userId: targetId });
    }

    // Check if actor can delete target user (includes self-deletion check)
    this.authorizationService.assertCanDeleteUser(
      actorId,
      actorRole,
      targetId,
      targetUser.role as Role
    );

    // Prevent deleting the last super_admin
    if (targetUser.role === 'super_admin') {
      const superAdminCount = await this.prisma.user.count({
        where: { role: 'super_admin' },
      });

      if (superAdminCount <= 1) {
        this.logger.warn('Attempt to delete last super admin', {
          actorId,
          targetId,
        });
        throw new ForbiddenError(
          'Cannot delete the last super admin. Please promote another user to super admin first.'
        );
      }
    }

    await this.prisma.user.delete({
      where: { id: targetId },
    });

    this.logger.info('User deleted successfully', {
      actorId,
      targetId,
    });
  }
}
