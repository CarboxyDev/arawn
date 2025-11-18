import { ForbiddenError, UnauthorizedError } from '@repo/packages-utils';
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
      throw new UnauthorizedError('Authentication required');
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
    throw new UnauthorizedError('Invalid or expired session');
  }
}

export function requireRole(roles: string[]) {
  return async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    if (!request.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!roles.includes(request.user.role)) {
      throw new ForbiddenError('Insufficient permissions', {
        required: roles,
        current: request.user.role,
      });
    }
  };
}
