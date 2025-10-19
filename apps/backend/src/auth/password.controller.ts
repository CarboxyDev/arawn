import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { ApiResponse as ApiResponseType } from '@repo/shared-types';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { PasswordService } from '@/auth/password.service';

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(8, 'Password must be at least 8 characters'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

class ChangePasswordDto extends createZodDto(ChangePasswordSchema) {}

@ApiTags('Password')
@Controller('password')
export class PasswordController {
  constructor(private readonly passwordService: PasswordService) {}

  @Post('change')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Change password and invalidate all other sessions',
  })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid current password' })
  async changePassword(
    @CurrentUser() user: any,
    @Body() dto: ChangePasswordDto
  ): Promise<ApiResponseType> {
    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException(
        'New password must be different from current password'
      );
    }

    await this.passwordService.changePassword(
      user.id,
      dto.currentPassword,
      dto.newPassword
    );

    return {
      success: true,
      message:
        'Password changed successfully. All other sessions have been revoked.',
    };
  }
}
