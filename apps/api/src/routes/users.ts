import {
  ErrorResponseSchema,
  MessageResponseSchema,
  SuccessResponseSchema,
} from '@repo/packages-types/api-response';
import {
  PaginatedResponseSchema,
  QueryUsersSchema,
} from '@repo/packages-types/pagination';
import {
  CreateUserSchema,
  GetUserByIdSchema,
  UpdateUserSchema,
  UserSchema,
} from '@repo/packages-types/user';
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
        response: {
          200: PaginatedResponseSchema(UserSchema),
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
        },
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
        response: {
          200: SuccessResponseSchema(UserSchema),
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
        description: 'Get user by ID (Admin only)',
        tags: ['Users'],
      },
    },
    async (request) => {
      const user = await app.usersService.getUserById(request.params.id);
      return { data: user };
    }
  );

  // POST /users - Create a new user (Admin only)
  server.post(
    '/users',
    {
      preHandler: [requireAuth, requireRole(['admin', 'super_admin'])],
      schema: {
        body: CreateUserSchema,
        response: {
          201: SuccessResponseSchema(UserSchema),
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
          409: ErrorResponseSchema,
        },
        description: 'Create a new user (Admin only)',
        tags: ['Users'],
      },
    },
    async (request, reply) => {
      const user = await app.usersService.createUser(request.body);

      return reply.status(201).send({ data: user });
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
        response: {
          200: SuccessResponseSchema(UserSchema),
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
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

      return { data: user };
    }
  );

  // DELETE /users/:id - Delete user by ID (Admin only)
  server.delete(
    '/users/:id',
    {
      preHandler: [requireAuth, requireRole(['admin', 'super_admin'])],
      schema: {
        params: GetUserByIdSchema,
        response: {
          200: MessageResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
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

      return { message: 'User deleted successfully' };
    }
  );
};

export default usersRoutes;
