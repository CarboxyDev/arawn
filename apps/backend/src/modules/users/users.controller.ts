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
  CreateUserSchema,
  GetUserByIdSchema,
  QueryUsersSchema,
  UpdateUserSchema,
} from '@repo/packages-types';
import { PaginatedResponse } from '@repo/packages-types';
import { User } from '@repo/packages-types';
import { ApiResponse } from '@repo/packages-types';
import { createZodDto } from 'nestjs-zod';

import { Roles } from '@/auth/decorators/roles.decorator';
import { UsersService } from '@/modules/users/users.service';

class CreateUserDto extends createZodDto(CreateUserSchema) {}
class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
class GetUserByIdDto extends createZodDto(GetUserByIdSchema) {}
class QueryUsersDto extends createZodDto(QueryUsersSchema) {}

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated users with filtering and sorting' })
  @SwaggerResponse({ status: 200, description: 'Returns paginated users' })
  getUsers(@Query() query: QueryUsersDto): PaginatedResponse<User> {
    return this.usersService.getUsers(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @SwaggerResponse({ status: 200, description: 'Returns user' })
  @SwaggerResponse({ status: 404, description: 'User not found' })
  getUserById(@Param() params: GetUserByIdDto): ApiResponse<User> {
    return {
      success: true,
      data: this.usersService.getUserById(params.id),
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @SwaggerResponse({ status: 201, description: 'User created successfully' })
  @SwaggerResponse({ status: 400, description: 'Invalid request body' })
  @HttpCode(HttpStatus.CREATED)
  createUser(@Body() createUserDto: CreateUserDto): ApiResponse<User> {
    return {
      success: true,
      message: 'User created successfully',
      data: this.usersService.createUser(createUserDto),
    };
  }

  @Patch(':id')
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
      data: this.usersService.updateUser(params.id, updateUserDto),
    };
  }

  @Delete(':id')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Delete user by ID (Admin only)' })
  @SwaggerResponse({ status: 200, description: 'User deleted successfully' })
  @SwaggerResponse({ status: 403, description: 'Insufficient permissions' })
  @SwaggerResponse({ status: 404, description: 'User not found' })
  deleteUser(@Param() params: GetUserByIdDto): ApiResponse<void> {
    this.usersService.deleteUser(params.id);
    return {
      success: true,
      message: 'User deleted successfully',
    };
  }
}
