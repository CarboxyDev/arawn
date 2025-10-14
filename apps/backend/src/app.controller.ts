import { Controller, Get } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiTags,
} from '@nestjs/swagger';
import { type ApiResponse, type HealthCheck } from '@repo/shared-types';

import { AppService } from '@/app.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @SwaggerResponse({ status: 200, description: 'Service is healthy' })
  getHealth(): HealthCheck {
    return this.appService.getHealth();
  }

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
}
