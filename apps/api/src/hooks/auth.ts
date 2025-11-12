import type { FastifyReply, FastifyRequest } from 'fastify';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  session?: {
    id: string;
  };
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
  }
}

export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const session = await request.server.auth.api.getSession({
      headers: request.headers as unknown as Headers,
    });

    if (!session?.user) {
      return reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    // Better Auth admin plugin adds role to user object
    const userWithRole = session.user as typeof session.user & {
      role?: string;
    };

    request.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: userWithRole.role || 'user',
      session: session.session
        ? {
            id: session.session.id,
          }
        : undefined,
    };
  } catch (error) {
    request.log.error(error, 'Auth hook error');
    return reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Invalid or expired session',
    });
  }
}

export function requireRole(roles: string[]) {
  return async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    if (!request.user) {
      return reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    if (!roles.includes(request.user.role)) {
      return reply.status(403).send({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Insufficient permissions',
      });
    }
  };
}
