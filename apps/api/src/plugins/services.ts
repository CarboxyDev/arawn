import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import type { Env } from '@/config/env';
import { loadEnv } from '@/config/env';
import { AccountsService } from '@/services/accounts.service';
import { AuditService } from '@/services/audit.service';
import { AuthorizationService } from '@/services/authorization.service';
import { EmailService } from '@/services/email.service';
import { FileStorageService } from '@/services/file-storage.service';
import { PasswordService } from '@/services/password.service';
import { SessionsService } from '@/services/sessions.service';
import { StatsService } from '@/services/stats.service';
import { UploadsService } from '@/services/uploads.service';
import { UsersService } from '@/services/users.service';

declare module 'fastify' {
  interface FastifyInstance {
    env: Env;
    authorizationService: AuthorizationService;
    usersService: UsersService;
    sessionsService: SessionsService;
    passwordService: PasswordService;
    emailService: EmailService;
    fileStorageService: FileStorageService;
    uploadsService: UploadsService;
    accountsService: AccountsService;
    auditService: AuditService;
    statsService: StatsService;
  }
}

const servicesPlugin: FastifyPluginAsync = async (app) => {
  const env = loadEnv();

  const authorizationService = new AuthorizationService(app.logger);
  const emailService = new EmailService(env, app.logger, app.prisma);
  const fileStorageService = new FileStorageService(env, app.logger);
  const usersService = new UsersService(
    app.prisma,
    app.logger,
    authorizationService
  );
  const sessionsService = new SessionsService(app.prisma);
  const passwordService = new PasswordService(app.prisma, sessionsService);
  const uploadsService = new UploadsService(
    app.prisma,
    fileStorageService,
    app.logger
  );
  const accountsService = new AccountsService(app.prisma, app.logger);
  const auditService = new AuditService(app.prisma, app.logger);
  const statsService = new StatsService(app.prisma, app.logger);

  app.decorate('env', env);
  app.decorate('authorizationService', authorizationService);
  app.decorate('emailService', emailService);
  app.decorate('fileStorageService', fileStorageService);
  app.decorate('usersService', usersService);
  app.decorate('sessionsService', sessionsService);
  app.decorate('passwordService', passwordService);
  app.decorate('uploadsService', uploadsService);
  app.decorate('accountsService', accountsService);
  app.decorate('auditService', auditService);
  app.decorate('statsService', statsService);

  app.log.info('[+] Services configured');
};

export default fp(servicesPlugin);
