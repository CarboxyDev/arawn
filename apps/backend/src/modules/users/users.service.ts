import { Injectable, NotFoundException } from '@nestjs/common';
import {
  type CreateUser,
  type PaginatedResponse,
  type QueryUsers,
  type UpdateUser,
  type User,
} from '@repo/shared-types';
import { randomUUID } from 'crypto';

@Injectable()
export class UsersService {
  private users: User[] = [];

  getUsers(query: QueryUsers): PaginatedResponse<User> {
    let filteredUsers = [...this.users];

    if (query.search) {
      const searchLower = query.search.toLowerCase();
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      );
    }

    filteredUsers.sort((a, b) => {
      const aValue = a[query.sortBy];
      const bValue = b[query.sortBy];
      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return query.sortOrder === 'asc' ? comparison : -comparison;
    });

    const total = filteredUsers.length;
    const totalPages = Math.ceil(total / query.limit);
    const start = (query.page - 1) * query.limit;
    const paginatedUsers = filteredUsers.slice(start, start + query.limit);

    return {
      success: true,
      data: paginatedUsers,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
      },
    };
  }

  getUserById(id: string): User {
    const user = this.users.find((u) => u.id === id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  createUser(createUser: CreateUser): User {
    const user: User = {
      id: randomUUID(),
      ...createUser,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.users.push(user);
    return user;
  }

  updateUser(id: string, updateUser: UpdateUser): User {
    const userIndex = this.users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updateUser,
      updatedAt: new Date().toISOString(),
    };

    return this.users[userIndex];
  }

  deleteUser(id: string): void {
    const userIndex = this.users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    this.users.splice(userIndex, 1);
  }
}
