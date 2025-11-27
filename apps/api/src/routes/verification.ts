import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { requireAuth } from '@/hooks/auth';

const ResendVerificationSchema = z.object({
  email: z.string().email().optional(),
});

const verificationRoutes: FastifyPluginAsync = async (app) => {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // POST /verification/resend - Resend verification email
  server.post(
    '/verification/resend',
    {
      preHandler: [requireAuth],
      schema: {
        body: ResendVerificationSchema,
        description:
          'Resend verification email to authenticated user or specified email',
        tags: ['Verification'],
      },
    },
    async (request, reply) => {
      const currentUser = request.user;
      if (!currentUser) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
      }

      const targetEmail = request.body.email || currentUser.email;

      if (request.body.email && request.body.email !== currentUser.email) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'You can only resend verification for your own email',
        });
      }

      const user = await app.prisma.user.findUnique({
        where: { email: targetEmail },
      });

      if (!user) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'User not found',
        });
      }

      if (user.emailVerified) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'Email is already verified',
        });
      }

      try {
        await app.auth.api.sendVerificationEmail({
          body: {
            email: user.email,
            callbackURL: app.env.FRONTEND_URL,
          },
        });

        return { message: 'Verification email sent successfully' };
      } catch (error) {
        request.log.error(
          {
            err: error instanceof Error ? error : new Error(String(error)),
            email: user.email,
          },
          'Failed to send verification email via Better Auth'
        );

        return reply.status(500).send({
          error: 'Email Send Failed',
          message:
            'Failed to send verification email. Please try again later or contact support.',
        });
      }
    }
  );
};

export default verificationRoutes;
