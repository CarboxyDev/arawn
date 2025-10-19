import { Injectable, NotFoundException } from '@nestjs/common';
import {
  type CreateUser,
  type PaginatedResponse,
  type QueryUsers,
  type UpdateUser,
  type User,
} from '@repo/packages-types';

import { LoggerService } from '@/common/logger.service';
import { PrismaService } from '@/database/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService
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
      success: true,
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
      throw new NotFoundException(`User with ID ${id} not found`);
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

  async updateUser(id: string, updateUser: UpdateUser): Promise<User> {
    this.logger.info('Updating user', { userId: id });

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      this.logger.warn('User not found for update', { userId: id });
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUser,
    });

    this.logger.info('User updated successfully', { userId: id });
    return updatedUser as User;
  }

  async deleteUser(id: string): Promise<void> {
    this.logger.info('Deleting user', { userId: id });

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      this.logger.warn('User not found for deletion', { userId: id });
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.prisma.user.delete({
      where: { id },
    });

    this.logger.info('User deleted successfully', { userId: id });
  }
}
