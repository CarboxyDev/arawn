import { Injectable } from '@nestjs/common';
import {
  type CreateUser,
  type HealthCheck,
  type User,
} from '@repo/shared-types';
import { randomUUID } from 'crypto';

@Injectable()
export class AppService {
  private users: User[] = [];
  private readonly startTime = Date.now();

  getHealth(): HealthCheck {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime,
      environment:
        (process.env.NODE_ENV as 'development' | 'staging' | 'production') ||
        'development',
    };
  }

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
