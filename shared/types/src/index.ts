import { z } from 'zod';

// Health Check Schemas
export const HealthCheckSchema = z.object({
  status: z.enum(['ok', 'error']),
  timestamp: z.string().datetime(),
  version: z.string(),
  uptime: z.number().nonnegative(),
  environment: z.enum(['development', 'staging', 'production']),
});

export type HealthCheck = z.infer<typeof HealthCheckSchema>;

// User Schemas
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  createdAt: z.date().or(z.string().datetime()),
  updatedAt: z.date().or(z.string().datetime()),
});

export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateUser = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export type UpdateUser = z.infer<typeof UpdateUserSchema>;

export const GetUserByIdSchema = z.object({
  id: z.string().uuid(),
});

export type GetUserById = z.infer<typeof GetUserByIdSchema>;

// Pagination and Query Schemas
export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type Pagination = z.infer<typeof PaginationSchema>;

export const QueryUsersSchema = PaginationSchema.extend({
  search: z.string().optional(),
  sortBy: z.enum(['name', 'email', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type QueryUsers = z.infer<typeof QueryUsersSchema>;

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(
  dataSchema: T
) =>
  z.object({
    success: z.literal(true),
    data: z.array(dataSchema),
    pagination: z.object({
      page: z.number().int().positive(),
      limit: z.number().int().positive(),
      total: z.number().int().nonnegative(),
      totalPages: z.number().int().nonnegative(),
    }),
  });

export type PaginatedResponse<T> = {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

// API Response Schemas
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.unknown().optional(),
  error: z.string().optional(),
});

export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
};
