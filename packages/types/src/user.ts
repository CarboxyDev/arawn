import { z } from 'zod';

import { RoleSchema } from './role';

export const UserSchema = z.object({
  id: z.string().min(1).describe('Unique user identifier'),
  email: z
    .string()
    .email()
    .describe('User email address')
    .transform((val) => val.toLowerCase()),
  name: z.string().min(1).describe('User full name'),
  role: RoleSchema.default('user').describe('User role in the system'),
  createdAt: z
    .date()
    .or(z.string().datetime())
    .describe('Account creation timestamp'),
  updatedAt: z
    .date()
    .or(z.string().datetime())
    .describe('Last update timestamp'),
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
  id: z.string().min(1).describe('User ID to retrieve'),
});

export type GetUserById = z.infer<typeof GetUserByIdSchema>;
