import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import {
  CreateUserSchema,
  type CreateUser,
  type User,
  type HealthCheck,
  type ApiResponse,
} from '@repo/shared-types';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth(): HealthCheck {
    return this.appService.getHealth();
  }

  @Get()
  getHello(): ApiResponse<string> {
    return {
      success: true,
      message: 'Welcome to Arawn Monorepo API',
      data: this.appService.getHello(),
    };
  }

  @Get('users')
  getUsers(): ApiResponse<User[]> {
    return {
      success: true,
      data: this.appService.getUsers(),
    };
  }

  @Post('users')
  createUser(@Body() createUserDto: CreateUser): ApiResponse<User> {
    const validatedUser = CreateUserSchema.parse(createUserDto);
    return {
      success: true,
      message: 'User created successfully',
      data: this.appService.createUser(validatedUser),
    };
  }
}
