import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const ExampleSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

const exampleRoutes: FastifyPluginAsync = async (app) => {
  app.get('/example', async () => {
    return { message: 'Hello from Fastify API with Zod validation!' };
  });

  app.post(
    '/example',
    {
      schema: {
        body: ExampleSchema,
        response: {
          200: z.object({
            message: z.string(),
            data: ExampleSchema,
          }),
        },
      },
    },
    async (request) => {
      return {
        message: 'Validation successful!',
        data: request.body,
      };
    }
  );
};

export default exampleRoutes;
