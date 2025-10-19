import { z } from 'zod';

export const RoleSchema = z.enum(['user', 'admin', 'super_admin']);

export type Role = z.infer<typeof RoleSchema>;
