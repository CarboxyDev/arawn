import { z } from 'zod';

import { RoleSchema } from './role';

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  role: RoleSchema.default('user'),
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
