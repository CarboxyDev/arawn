import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  type ApiResponse,
  CreateUserSchema,
  GetUserByIdSchema,
  type HealthCheck,
  type PaginatedResponse,
  QueryUsersSchema,
  UpdateUserSchema,
  type User,
} from '@repo/shared-types';
import { createZodDto } from 'nestjs-zod';

import { AppService } from '@/app.service';

class CreateUserDto extends createZodDto(CreateUserSchema) {}
class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
class GetUserByIdDto extends createZodDto(GetUserByIdSchema) {}
class QueryUsersDto extends createZodDto(QueryUsersSchema) {}

@ApiTags('API')
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

  @Get('users')
  @ApiOperation({ summary: 'Get paginated users with filtering and sorting' })
  @SwaggerResponse({ status: 200, description: 'Returns paginated users' })
  getUsers(@Query() query: QueryUsersDto): PaginatedResponse<User> {
    return this.appService.getUsers(query);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user by ID' })
  @SwaggerResponse({ status: 200, description: 'Returns user' })
  @SwaggerResponse({ status: 404, description: 'User not found' })
  getUserById(@Param() params: GetUserByIdDto): ApiResponse<User> {
    return {
      success: true,
      data: this.appService.getUserById(params.id),
    };
  }

  @Post('users')
  @ApiOperation({ summary: 'Create a new user' })
  @SwaggerResponse({ status: 201, description: 'User created successfully' })
  @SwaggerResponse({ status: 400, description: 'Invalid request body' })
  @HttpCode(HttpStatus.CREATED)
  createUser(@Body() createUserDto: CreateUserDto): ApiResponse<User> {
    return {
      success: true,
      message: 'User created successfully',
      data: this.appService.createUser(createUserDto),
    };
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Update user by ID' })
  @SwaggerResponse({ status: 200, description: 'User updated successfully' })
  @SwaggerResponse({ status: 400, description: 'Invalid request body' })
  @SwaggerResponse({ status: 404, description: 'User not found' })
  updateUser(
    @Param() params: GetUserByIdDto,
    @Body() updateUserDto: UpdateUserDto
  ): ApiResponse<User> {
    return {
      success: true,
      message: 'User updated successfully',
      data: this.appService.updateUser(params.id, updateUserDto),
    };
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user by ID' })
  @SwaggerResponse({ status: 200, description: 'User deleted successfully' })
  @SwaggerResponse({ status: 404, description: 'User not found' })
  deleteUser(@Param() params: GetUserByIdDto): ApiResponse<void> {
    this.appService.deleteUser(params.id);
    return {
      success: true,
      message: 'User deleted successfully',
    };
  }
}
