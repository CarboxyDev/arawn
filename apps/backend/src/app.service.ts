import { Injectable } from '@nestjs/common';
import { type User, type CreateUser } from '@repo/shared-types';
import { randomUUID } from 'crypto';

@Injectable()
export class AppService {
  private users: User[] = [];

  getHello(): string {
    return 'Hello from Arawn Backend!';
  }

  getUsers(): User[] {
    return this.users;
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
}
