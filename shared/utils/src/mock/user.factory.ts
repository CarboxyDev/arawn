import { faker } from '@faker-js/faker';

export interface MockUserData {
  email: string;
  name: string;
}

export interface MockUserOptions {
  email?: string;
  name?: string;
}

/**
 * Generate a single mock user (without id/timestamps)
 * Use this for Prisma create operations where the DB generates those fields
 */
export function createMockUserData(options?: MockUserOptions): MockUserData {
  return {
    email: options?.email ?? faker.internet.email(),
    name: options?.name ?? faker.person.fullName(),
  };
}

/**
 * Generate multiple mock users
 */
export function createMockUsersData(
  count: number,
  options?: MockUserOptions
): MockUserData[] {
  return Array.from({ length: count }, () => createMockUserData(options));
}

/**
 * Generate a mock user with all fields (including id/timestamps)
 * Use this for testing when you need a complete user object
 */
export function createMockUser(options?: Partial<MockUser>): MockUser {
  return {
    id: options?.id ?? faker.string.uuid(),
    email: options?.email ?? faker.internet.email(),
    name: options?.name ?? faker.person.fullName(),
    createdAt: options?.createdAt ?? faker.date.past(),
    updatedAt: options?.updatedAt ?? faker.date.recent(),
  };
}

/**
 * Generate multiple complete mock users
 */
export function createMockUsers(
  count: number,
  options?: Partial<MockUser>
): MockUser[] {
  return Array.from({ length: count }, () => createMockUser(options));
}

export interface MockUser {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
