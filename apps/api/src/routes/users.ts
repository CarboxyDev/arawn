import {
  CreateUserSchema,
  GetUserByIdSchema,
  QueryUsersSchema,
  UpdateUserSchema,
} from '@repo/packages-types';
import { message, success } from '@repo/packages-utils';
import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';

import { requireAuth, requireRole } from '@/hooks/auth';

const usersRoutes: FastifyPluginAsync = async (app) => {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // GET /users - Get paginated users with filtering and sorting
  server.get(
    '/users',
    {
      schema: {
        querystring: QueryUsersSchema,
        description: 'Get paginated users with filtering and sorting',
        tags: ['Users'],
      },
    },
    async (request) => {
      return app.usersService.getUsers(request.query);
    }
  );

  // GET /users/:id - Get user by ID
  server.get(
    '/users/:id',
    {
      schema: {
        params: GetUserByIdSchema,
        description: 'Get user by ID',
        tags: ['Users'],
      },
    },
    async (request) => {
      const user = await app.usersService.getUserById(request.params.id);
      return success(user);
    }
  );

  // POST /users - Create a new user
  server.post(
    '/users',
    {
      schema: {
        body: CreateUserSchema,
        description: 'Create a new user',
        tags: ['Users'],
      },
    },
    async (request, reply) => {
      const user = await app.usersService.createUser(request.body);
      return reply.status(201).send(success(user));
    }
  );

  // PATCH /users/:id - Update user by ID
  server.patch(
    '/users/:id',
    {
      schema: {
        params: GetUserByIdSchema,
        body: UpdateUserSchema,
        description: 'Update user by ID',
        tags: ['Users'],
      },
    },
    async (request) => {
      const user = await app.usersService.updateUser(
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
      await app.usersService.deleteUser(request.params.id);
      return message('User deleted successfully');
    }
  );
};

export default usersRoutes;
