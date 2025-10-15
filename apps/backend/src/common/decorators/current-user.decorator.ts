/**
 * Current User Decorator
 *
 * Extracts authenticated user from request.
 * Supports optional field selection: @CurrentUser('id')
 */

// import { createParamDecorator, ExecutionContext } from '@nestjs/common';
// import type { Request } from 'express';

// export const CurrentUser = createParamDecorator(
//   (field: string | undefined, ctx: ExecutionContext) => {
//     const request = ctx.switchToHttp().getRequest<Request>();
//     const user = request.user;
//
//     return field ? user?.[field] : user;
//   }
// );
