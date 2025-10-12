import { describe, expect, it } from 'vitest';

import {
  ApiResponseSchema,
  CreateUserSchema,
  HealthCheckSchema,
  UserSchema,
} from '../index';

describe('HealthCheckSchema', () => {
  it('should validate a valid health check object', () => {
    const validHealthCheck = {
      status: 'ok' as const,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: 12345,
      environment: 'development' as const,
    };

    const result = HealthCheckSchema.safeParse(validHealthCheck);
    expect(result.success).toBe(true);
  });

  it('should reject invalid status', () => {
    const invalidHealthCheck = {
      status: 'invalid',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: 12345,
      environment: 'development',
    };

    const result = HealthCheckSchema.safeParse(invalidHealthCheck);
    expect(result.success).toBe(false);
  });

  it('should reject negative uptime', () => {
    const invalidHealthCheck = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: -100,
      environment: 'development',
    };

    const result = HealthCheckSchema.safeParse(invalidHealthCheck);
    expect(result.success).toBe(false);
  });

  it('should reject invalid environment', () => {
    const invalidHealthCheck = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: 12345,
      environment: 'invalid',
    };

    const result = HealthCheckSchema.safeParse(invalidHealthCheck);
    expect(result.success).toBe(false);
  });
});

describe('UserSchema', () => {
  it('should validate a valid user object with Date', () => {
    const validUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      name: 'John Doe',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = UserSchema.safeParse(validUser);
    expect(result.success).toBe(true);
  });

  it('should validate a valid user object with ISO string dates', () => {
    const validUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      name: 'John Doe',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = UserSchema.safeParse(validUser);
    expect(result.success).toBe(true);
  });

  it('should reject invalid UUID', () => {
    const invalidUser = {
      id: 'not-a-uuid',
      email: 'test@example.com',
      name: 'John Doe',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = UserSchema.safeParse(invalidUser);
    expect(result.success).toBe(false);
  });

  it('should reject invalid email', () => {
    const invalidUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'not-an-email',
      name: 'John Doe',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = UserSchema.safeParse(invalidUser);
    expect(result.success).toBe(false);
  });

  it('should reject empty name', () => {
    const invalidUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      name: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = UserSchema.safeParse(invalidUser);
    expect(result.success).toBe(false);
  });
});

describe('CreateUserSchema', () => {
  it('should validate user creation without id and timestamps', () => {
    const validCreateUser = {
      email: 'new@example.com',
      name: 'Jane Doe',
    };

    const result = CreateUserSchema.safeParse(validCreateUser);
    expect(result.success).toBe(true);
  });

  it('should omit id, createdAt, and updatedAt fields', () => {
    const createUserWithExtra = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'new@example.com',
      name: 'Jane Doe',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = CreateUserSchema.safeParse(createUserWithExtra);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        email: 'new@example.com',
        name: 'Jane Doe',
      });
    }
  });

  it('should reject invalid email in create', () => {
    const invalidCreateUser = {
      email: 'invalid-email',
      name: 'Jane Doe',
    };

    const result = CreateUserSchema.safeParse(invalidCreateUser);
    expect(result.success).toBe(false);
  });
});

describe('ApiResponseSchema', () => {
  it('should validate success response with data', () => {
    const validResponse = {
      success: true,
      message: 'Operation successful',
      data: { id: 1, value: 'test' },
    };

    const result = ApiResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
  });

  it('should validate error response', () => {
    const validResponse = {
      success: false,
      error: 'Something went wrong',
    };

    const result = ApiResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
  });

  it('should allow minimal response with just success flag', () => {
    const minimalResponse = {
      success: true,
    };

    const result = ApiResponseSchema.safeParse(minimalResponse);
    expect(result.success).toBe(true);
  });

  it('should reject response without success field', () => {
    const invalidResponse = {
      message: 'No success field',
    };

    const result = ApiResponseSchema.safeParse(invalidResponse);
    expect(result.success).toBe(false);
  });
});
