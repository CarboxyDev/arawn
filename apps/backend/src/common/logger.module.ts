import { Global, Module } from '@nestjs/common';

import { LoggerService } from '@/common/logger.service';

/**
 * Global logger module providing LoggerService throughout the application
 *
 * This module is marked as @Global, so LoggerService can be injected
 * anywhere without importing the module explicitly.
 *
 * Usage in controllers/services:
 * ```typescript
 * @Injectable()
 * export class UsersService {
 *   constructor(private readonly logger: LoggerService) {
 *     this.logger.setContext('UsersService');
 *   }
 *
 *   async createUser(data: CreateUserDto) {
 *     this.logger.info('Creating user', { email: data.email });
 *     // ...
 *   }
 * }
 * ```
 */
@Global()
@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
