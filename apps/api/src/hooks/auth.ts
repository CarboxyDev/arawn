import { ForbiddenError, UnauthorizedError } from '@repo/packages-utils/errors';
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

    // Fetch user from database to check ban status and get latest role
    const user = await request.server.prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        banned: true,
        banReason: true,
        banExpires: true,
      },
    });

    if (!user) {
      request.log.warn(
        {
          userId: session.user.id,
        },
        'User not found in database'
      );
      throw new UnauthorizedError('User not found');
    }

    // Check if user is banned
    if (user.banned) {
      // Check if ban has expired
      if (user.banExpires && new Date() > user.banExpires) {
        // Automatically unban user
        await request.server.prisma.user.update({
          where: { id: user.id },
          data: {
            banned: false,
            banReason: null,
            banExpires: null,
          },
        });
        request.log.info({ userId: user.id }, 'User ban expired and removed');
      } else {
        request.log.warn(
          {
            userId: user.id,
            banReason: user.banReason,
          },
          'Banned user attempted to access system'
        );
        throw new ForbiddenError('Your account has been banned', {
          reason: user.banReason,
          expiresAt: user.banExpires?.toISOString(),
        });
      }
    }

    request.user = {
      id: user.id,
      email: user.email,
      name: user.name ?? '',
      role: user.role,
      session: session.session
        ? {
            id: session.session.id,
          }
        : undefined,
    };
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      throw error;
    }
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
