import { describe, expect, it } from 'vitest';

import {
  createMockUser,
  createMockUserData,
  createMockUsers,
  createMockUsersData,
} from '../user.factory';

describe('User Factory', () => {
  describe('createMockUserData', () => {
    it('should generate user data without id and timestamps', () => {
      const userData = createMockUserData();

      expect(userData).toHaveProperty('email');
      expect(userData).toHaveProperty('name');
      expect(userData).not.toHaveProperty('id');
      expect(userData).not.toHaveProperty('createdAt');
      expect(userData).not.toHaveProperty('updatedAt');
      expect(typeof userData.email).toBe('string');
      expect(userData.email).toMatch(/@/);
      expect(typeof userData.name).toBe('string');
      expect(userData.name.length).toBeGreaterThan(0);
    });

    it('should accept custom email', () => {
      const customEmail = 'custom@example.com';
      const userData = createMockUserData({ email: customEmail });

      expect(userData.email).toBe(customEmail);
    });

    it('should accept custom name', () => {
      const customName = 'John Doe';
      const userData = createMockUserData({ name: customName });

      expect(userData.name).toBe(customName);
    });

    it('should generate unique users by default', () => {
      const user1 = createMockUserData();
      const user2 = createMockUserData();

      expect(user1.email).not.toBe(user2.email);
      expect(user1.name).not.toBe(user2.name);
    });
  });

  describe('createMockUsersData', () => {
    it('should generate multiple users', () => {
      const count = 5;
      const users = createMockUsersData(count);

      expect(users).toHaveLength(count);
      users.forEach((user) => {
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('name');
      });
    });

    it('should generate unique users', () => {
      const users = createMockUsersData(10);
      const emails = users.map((u) => u.email);
      const uniqueEmails = new Set(emails);

      expect(uniqueEmails.size).toBe(users.length);
    });

    it('should apply custom options to all users', () => {
      const customName = 'Same Name';
      const users = createMockUsersData(3, { name: customName });

      users.forEach((user) => {
        expect(user.name).toBe(customName);
        expect(user.email).toMatch(/@/);
      });
    });
  });

  describe('createMockUser', () => {
    it('should generate complete user with all fields', () => {
      const user = createMockUser();

      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('createdAt');
      expect(user).toHaveProperty('updatedAt');
      expect(typeof user.id).toBe('string');
      expect(user.id.length).toBeGreaterThan(0);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should accept partial overrides', () => {
      const customId = 'custom-id-123';
      const customEmail = 'custom@test.com';
      const user = createMockUser({ id: customId, email: customEmail });

      expect(user.id).toBe(customId);
      expect(user.email).toBe(customEmail);
      expect(user.name).toBeTruthy();
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should generate unique IDs by default', () => {
      const user1 = createMockUser();
      const user2 = createMockUser();

      expect(user1.id).not.toBe(user2.id);
    });
  });

  describe('createMockUsers', () => {
    it('should generate multiple complete users', () => {
      const count = 5;
      const users = createMockUsers(count);

      expect(users).toHaveLength(count);
      users.forEach((user) => {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('createdAt');
        expect(user).toHaveProperty('updatedAt');
      });
    });

    it('should generate unique IDs for all users', () => {
      const users = createMockUsers(10);
      const ids = users.map((u) => u.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(users.length);
    });

    it('should apply partial options to all users', () => {
      const customName = 'Same Name';
      const users = createMockUsers(3, { name: customName });

      users.forEach((user) => {
        expect(user.name).toBe(customName);
        expect(user.id).toBeTruthy();
        expect(user.email).toMatch(/@/);
      });
    });
  });
});
