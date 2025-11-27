import type { Role } from '@repo/packages-types/role';
import { ForbiddenError } from '@repo/packages-utils/errors';

import type { LoggerService } from '@/common/logger.service';

export interface AuthorizationContext {
  actorId: string;
  actorRole: Role;
  targetUserId?: string;
  targetUserRole?: Role;
}

export class AuthorizationService {
  private readonly roleHierarchy: Record<Role, number> = {
    super_admin: 3,
    admin: 2,
    user: 1,
  };

  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('AuthorizationService');
  }

  private getRoleLevel(role: Role): number {
    return this.roleHierarchy[role];
  }

  canModifyUser(actorRole: Role, targetRole: Role): boolean {
    const actorLevel = this.getRoleLevel(actorRole);
    const targetLevel = this.getRoleLevel(targetRole);

    return actorLevel > targetLevel;
  }

  canDeleteUser(actorRole: Role, targetRole: Role): boolean {
    return this.canModifyUser(actorRole, targetRole);
  }

  canChangeRole(
    actorRole: Role,
    targetCurrentRole: Role,
    newRole: Role
  ): boolean {
    const actorLevel = this.getRoleLevel(actorRole);
    const targetLevel = this.getRoleLevel(targetCurrentRole);
    const newRoleLevel = this.getRoleLevel(newRole);

    return actorLevel > targetLevel && actorLevel > newRoleLevel;
  }

  canChangeEmail(actorRole: Role): boolean {
    return actorRole === 'super_admin';
  }

  assertCanModifyUser(
    actorId: string,
    actorRole: Role,
    targetUserId: string,
    targetRole: Role
  ): void {
    if (actorId === targetUserId) {
      return;
    }

    if (!this.canModifyUser(actorRole, targetRole)) {
      this.logger.warn('Authorization failed: Cannot modify user', {
        actorId,
        actorRole,
        targetUserId,
        targetRole,
      });
      throw new ForbiddenError(
        `Insufficient permissions to modify user with role: ${targetRole}`,
        {
          requiredLevel: 'higher than target',
          actorRole,
          targetRole,
        }
      );
    }
  }

  assertCanDeleteUser(
    actorId: string,
    actorRole: Role,
    targetUserId: string,
    targetRole: Role
  ): void {
    if (actorId === targetUserId) {
      this.logger.warn('Authorization failed: Cannot delete own account', {
        actorId,
      });
      throw new ForbiddenError('Cannot delete your own account');
    }

    if (!this.canDeleteUser(actorRole, targetRole)) {
      this.logger.warn('Authorization failed: Cannot delete user', {
        actorId,
        actorRole,
        targetUserId,
        targetRole,
      });
      throw new ForbiddenError(
        `Insufficient permissions to delete user with role: ${targetRole}`,
        {
          requiredLevel: 'higher than target',
          actorRole,
          targetRole,
        }
      );
    }
  }

  assertCanChangeRole(
    actorId: string,
    actorRole: Role,
    targetUserId: string,
    targetCurrentRole: Role,
    newRole: Role
  ): void {
    if (actorId === targetUserId) {
      this.logger.warn('Authorization failed: Cannot modify own role', {
        actorId,
      });
      throw new ForbiddenError('Cannot modify your own role');
    }

    if (!this.canChangeRole(actorRole, targetCurrentRole, newRole)) {
      this.logger.warn('Authorization failed: Cannot change role', {
        actorId,
        actorRole,
        targetUserId,
        targetCurrentRole,
        newRole,
      });
      throw new ForbiddenError(
        `Insufficient permissions to change role from ${targetCurrentRole} to ${newRole}`,
        {
          requiredLevel: 'higher than both current and target roles',
          actorRole,
          targetCurrentRole,
          newRole,
        }
      );
    }
  }

  assertCanChangeEmail(actorRole: Role): void {
    if (!this.canChangeEmail(actorRole)) {
      this.logger.warn('Authorization failed: Cannot change email', {
        actorRole,
      });
      throw new ForbiddenError(
        'Only super admins can change user email addresses',
        {
          requiredRole: 'super_admin',
          currentRole: actorRole,
        }
      );
    }
  }
}
