/**
 * API Key Guard - Machine-to-Machine Authentication
 *
 * Validates API keys for webhooks, cron jobs, or external integrations.
 * Alternative to JWT auth for service-to-service communication.
 */

// import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
// import type { Request } from 'express';

// @Injectable()
// export class ApiKeyGuard implements CanActivate {
//   canActivate(context: ExecutionContext): boolean {
//     const request = context.switchToHttp().getRequest<Request>();
//     const apiKey = request.headers['x-api-key'];
//
//     // Validate API key here
//     return true;
//   }
// }
