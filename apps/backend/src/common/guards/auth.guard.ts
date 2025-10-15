/**
 * Auth Guard - JWT Authentication
 *
 * Validates JWT tokens and attaches user to request.
 * Works with @Public() decorator to skip auth on certain routes.
 */

// import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { JwtService } from '@nestjs/jwt';

// @Injectable()
// export class AuthGuard implements CanActivate {
//   constructor(
//     private readonly jwtService: JwtService,
//     private readonly reflector: Reflector,
//   ) {}
//
//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     // Implementation here
//     return true;
//   }
// }
