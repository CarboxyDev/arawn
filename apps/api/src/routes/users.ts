import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const usersRoutes: FastifyPluginAsync = async (app) => {
  app.get('/users', async () => {
    const users = await app.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      take: 10,
    });

    return {
      data: users,
      count: users.length,
    };
  });

  app.get<{
    Params: { id: string };
  }>(
    '/users/:id',
    {
      schema: {
        params: z.object({
          id: z.string().cuid(),
        }),
      },
    },
    async (request, reply) => {
      const user = await app.prisma.user.findUnique({
        where: { id: request.params.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'User not found',
        });
      }

      return user;
    }
  );
};

export default usersRoutes;
