import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import type { Env } from '@/config/env';
import { loadEnv } from '@/config/env';
import { EmailService } from '@/services/email.service';
import { PasswordService } from '@/services/password.service';
import { SessionsService } from '@/services/sessions.service';
import { UsersService } from '@/services/users.service';

declare module 'fastify' {
  interface FastifyInstance {
    env: Env;
    usersService: UsersService;
    sessionsService: SessionsService;
    passwordService: PasswordService;
    emailService: EmailService;
  }
}

const servicesPlugin: FastifyPluginAsync = async (app) => {
  const env = loadEnv();

  const emailService = new EmailService(env, app.logger, app.prisma);
  const usersService = new UsersService(app.prisma, app.logger);
  const sessionsService = new SessionsService(app.prisma);
  const passwordService = new PasswordService(app.prisma, sessionsService);

  app.decorate('env', env);
  app.decorate('emailService', emailService);
  app.decorate('usersService', usersService);
  app.decorate('sessionsService', sessionsService);
  app.decorate('passwordService', passwordService);

  app.log.info('✅ Services configured');
};

export default fp(servicesPlugin);
