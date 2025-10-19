import { Controller, Get } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiResponse, HealthCheck, User } from '@repo/packages-types';

import { AppService } from '@/app.service';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { Public } from '@/auth/decorators/public.decorator';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @SwaggerResponse({ status: 200, description: 'Service is healthy' })
  getHealth(): HealthCheck {
    return this.appService.getHealth();
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Welcome message' })
  @SwaggerResponse({ status: 200, description: 'Returns welcome message' })
  getHello(): ApiResponse<string> {
    return {
      success: true,
      message: 'Welcome to Arawn Monorepo API',
      data: this.appService.getHello(),
    };
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user (protected route example)' })
  @SwaggerResponse({ status: 200, description: 'Returns current user' })
  @SwaggerResponse({ status: 401, description: 'Unauthorized' })
  getMe(@CurrentUser() user: User): ApiResponse<User> {
    return {
      success: true,
      message: 'Current user retrieved successfully',
      data: user,
    };
  }
}
