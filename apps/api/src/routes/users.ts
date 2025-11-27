import { QueryUsersSchema } from '@repo/packages-types/pagination';
import {
  CreateUserSchema,
  GetUserByIdSchema,
  UpdateUserSchema,
} from '@repo/packages-types/user';
import { message, success } from '@repo/packages-utils/response';
import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';

import { requireAuth, requireRole } from '@/hooks/auth';

const usersRoutes: FastifyPluginAsync = async (app) => {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // GET /users - Get paginated users with filtering and sorting (Admin only)
  server.get(
    '/users',
    {
      preHandler: [requireAuth, requireRole(['admin', 'super_admin'])],
      schema: {
        querystring: QueryUsersSchema,
        description:
          'Get paginated users with filtering and sorting (Admin only)',
        tags: ['Users'],
      },
    },
    async (request) => {
      return app.usersService.getUsers(request.query);
    }
  );

  // GET /users/:id - Get user by ID (Admin only)
  server.get(
    '/users/:id',
    {
      preHandler: [requireAuth, requireRole(['admin', 'super_admin'])],
      schema: {
        params: GetUserByIdSchema,
        description: 'Get user by ID (Admin only)',
        tags: ['Users'],
      },
    },
    async (request) => {
      const user = await app.usersService.getUserById(request.params.id);
      return success(user);
    }
  );

  // POST /users - Create a new user (Admin only)
  server.post(
    '/users',
    {
      preHandler: [requireAuth, requireRole(['admin', 'super_admin'])],
      schema: {
        body: CreateUserSchema,
        description: 'Create a new user (Admin only)',
        tags: ['Users'],
      },
    },
    async (request, reply) => {
      const user = await app.usersService.createUser(request.body);

      return reply.status(201).send(success(user));
    }
  );

  // PATCH /users/:id - Update user by ID (Admin only)
  server.patch(
    '/users/:id',
    {
      preHandler: [requireAuth, requireRole(['admin', 'super_admin'])],
      schema: {
        params: GetUserByIdSchema,
        body: UpdateUserSchema,
        description: 'Update user by ID (Admin only)',
        tags: ['Users'],
      },
    },
    async (request) => {
      const user = await app.usersService.updateUser(
        request.user!.id,
        request.user!.role as 'user' | 'admin' | 'super_admin',
        request.params.id,
        request.body
      );

      return success(user);
    }
  );

  // DELETE /users/:id - Delete user by ID (Admin only)
  server.delete(
    '/users/:id',
    {
      preHandler: [requireAuth, requireRole(['admin', 'super_admin'])],
      schema: {
        params: GetUserByIdSchema,
        description: 'Delete user by ID (Admin only)',
        tags: ['Users'],
      },
    },
    async (request) => {
      await app.usersService.deleteUser(
        request.user!.id,
        request.user!.role as 'user' | 'admin' | 'super_admin',
        request.params.id
      );

      return message('User deleted successfully');
    }
  );
};

export default usersRoutes;
