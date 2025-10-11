import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateUserSchema, type CreateUser, type User } from '@repo/shared-types';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('users')
  getUsers(): User[] {
    return this.appService.getUsers();
  }

  @Post('users')
  createUser(@Body() createUserDto: CreateUser): User {
    const validatedUser = CreateUserSchema.parse(createUserDto);
    return this.appService.createUser(validatedUser);
  }
}
