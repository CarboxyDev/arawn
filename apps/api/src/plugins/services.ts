import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { PasswordService } from '@/services/password.service';
import { SessionsService } from '@/services/sessions.service';
import { UsersService } from '@/services/users.service';

declare module 'fastify' {
  interface FastifyInstance {
    usersService: UsersService;
    sessionsService: SessionsService;
    passwordService: PasswordService;
  }
}

const servicesPlugin: FastifyPluginAsync = async (app) => {
  const usersService = new UsersService(app.prisma, app.logger);
  const sessionsService = new SessionsService(app.prisma);
  const passwordService = new PasswordService(app.prisma, sessionsService);

  app.decorate('usersService', usersService);
  app.decorate('sessionsService', sessionsService);
  app.decorate('passwordService', passwordService);

  app.log.info('✅ Services configured');
};

export default fp(servicesPlugin);
