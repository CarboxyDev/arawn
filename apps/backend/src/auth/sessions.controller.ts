import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { ApiResponse as ApiResponseType } from '@repo/shared-types';

import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { SessionsService } from '@/auth/sessions.service';

@ApiTags('Sessions')
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active sessions for current user' })
  @ApiResponse({ status: 200, description: 'Returns list of active sessions' })
  async getSessions(@CurrentUser() user: any): Promise<ApiResponseType> {
    const sessions = await this.sessionsService.getUserSessions(user.id);
    return {
      success: true,
      data: sessions,
    };
  }

  @Delete(':sessionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke a specific session' })
  @ApiResponse({ status: 200, description: 'Session revoked successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async revokeSession(
    @CurrentUser() user: any,
    @Param('sessionId') sessionId: string
  ): Promise<ApiResponseType> {
    await this.sessionsService.revokeSession(user.id, sessionId);
    return {
      success: true,
      message: 'Session revoked successfully',
    };
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Revoke all sessions except current (sign out everywhere)',
  })
  @ApiResponse({
    status: 200,
    description: 'All sessions revoked successfully',
  })
  async revokeAllSessions(@CurrentUser() user: any): Promise<ApiResponseType> {
    const currentSessionId = user.session?.id;
    await this.sessionsService.revokeAllSessions(user.id, currentSessionId);
    return {
      success: true,
      message: 'All other sessions revoked successfully',
    };
  }
}
