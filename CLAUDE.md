# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**AI Assistant Context:**
You are a Senior Full-stack Developer and an Expert in TypeScript, Next.js 15, React 19, NestJS, Prisma, PostgreSQL, TailwindCSS, and modern UI/UX frameworks like Shadcn UI. You are collaborating with a human developer on a production-ready full-stack application.

## Project Overview

Production-ready TypeScript monorepo using pnpm workspaces and Turborepo, featuring a Next.js frontend and NestJS backend with shared packages for types, utilities, and configuration.

## Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0

## Common Commands

### Development

```bash
pnpm dev              # Start all applications in dev mode (frontend on :3000, backend on :8080)
pnpm build            # Build all packages and applications
pnpm typecheck        # Type check all packages
pnpm lint             # Lint all packages
pnpm lint:fix         # Lint and auto-fix all packages
```

### Individual Package Commands

```bash
# Frontend (Next.js on port 3000)
cd apps/frontend
pnpm dev              # Start Next.js dev server
pnpm build            # Build production bundle
pnpm typecheck        # Type check only

# Backend (NestJS on port 8080)
cd apps/backend
pnpm dev              # Start NestJS with watch mode
pnpm build            # Build production bundle
pnpm start            # Run production build
# API docs available at http://localhost:8080/docs (Swagger + Scalar)

# Shared packages (types, utils, config)
cd shared/{package}
pnpm dev              # Watch mode with tsup
pnpm build            # Build with tsup
```

## Architecture

### Monorepo Structure

The repository follows a standard pnpm workspace pattern with Turborepo for task orchestration:

- `apps/frontend` - Next.js 15 application (App Router)
- `apps/backend` - NestJS application
- `shared/types` - Shared Zod schemas and TypeScript types
- `shared/utils` - Shared utility functions
- `shared/config` - Environment configuration with dotenv-flow and Zod validation

### Build Dependencies

Turborepo manages task dependencies automatically:

- All `build` tasks depend on `^build` (dependencies built first) and `typecheck`
- Dev mode tasks depend on `^build` (shared packages must be built before apps can import them)
- Shared packages use `tsup` to build both CJS and ESM outputs

### Shared Packages

All shared packages (`@repo/shared-types`, `@repo/shared-utils`, `@repo/shared-config`) are consumed as workspace dependencies:

- Export both CJS and ESM formats
- Include TypeScript declarations
- Must be built before apps can run in dev mode
- Frontend's `next.config.ts` transpiles these packages
- All use Zod v4.1.12 for validation (types and config packages)

### Database (Prisma + PostgreSQL)

The backend uses Prisma 6.17.1 as the ORM with PostgreSQL:

- **Schema**: Located in `apps/backend/prisma/schema.prisma`
- **Client**: Generated to `apps/backend/node_modules/.prisma/client`
- **Migrations**: Stored in `apps/backend/prisma/migrations/`
- **PrismaService**: Global NestJS service in `apps/backend/src/database/prisma/`
  - Extends PrismaClient with lifecycle hooks (onModuleInit)
  - Exported globally via PrismaModule for DI

**Database Commands (run from `apps/backend`):**

```bash
pnpm db:generate    # Generate Prisma Client
pnpm db:migrate     # Create and apply migrations
pnpm db:push        # Push schema changes (no migration files)
pnpm db:studio      # Open Prisma Studio GUI
pnpm db:seed        # Seed database
```

**Local Development with Docker:**

PostgreSQL runs in Docker via `docker-compose.yml` at the root:

```bash
docker-compose up -d      # Start PostgreSQL + pgAdmin
docker-compose down       # Stop services
docker-compose down -v    # Stop and wipe data
```

- **PostgreSQL**: `localhost:5432` (credentials in `docker-compose.yml`)
- **pgAdmin**: `http://localhost:5050` (admin@arawn.dev / admin)

**Environment Variables:**

- Backend uses `.env.local` for NestJS (via dotenv-flow)
- Prisma uses `.env` file (create from `.env.local.example`)
- `DATABASE_URL` must match Docker credentials: `postgresql://arawn:arawn_dev_password@localhost:5432/arawn_dev?sslmode=disable`

**Turborepo Integration:**

- `pnpm dev` automatically runs `db:generate` before starting the backend
- Ensures Prisma Client is available before NestJS starts

### Environment Configuration

Environment variables are managed per-app:

- **Backend**: Uses `@repo/shared-config` with `dotenv-flow` and Zod v4 validation
  - Configuration defined in `shared/config/src/index.ts`
  - Required: `NODE_ENV`, `API_URL`, `FRONTEND_URL`, `DATABASE_URL`, `PORT`
  - Uses `loadEnv()` from `@repo/shared-config` on startup
- **Frontend**: Uses Next.js environment variables
  - Required: `NEXT_PUBLIC_API_URL` (exposed to browser)
  - Configured in `apps/frontend/src/lib/env.ts`
  - Only `NEXT_PUBLIC_*` variables are exposed to the client
- Each app has `.env.local.example` files showing expected variables

### Security

Backend security middleware configured in `main.ts`:

- **Helmet**: Secure HTTP headers with dev-friendly CSP settings
- **Rate Limiting**: 10 requests per 60 seconds per IP via @nestjs/throttler
- **CORS**: Strict origin policy allowing only `FRONTEND_URL`
- ThrottlerGuard is applied globally to all routes

### Production Logging & Error Tracking

The backend uses Pino for structured, production-ready logging with request tracing and configurable verbosity.

**Philosophy**: Single unified logging pattern throughout the codebase. No alternatives - this is the way.

#### Environment Configuration

Control logging verbosity via `LOG_LEVEL` in `.env.local`:

```bash
# Logging verbosity level
LOG_LEVEL=normal  # minimal | normal | detailed | verbose
```

**Verbosity Levels:**

| Level      | When to Use         | What Gets Logged                                         |
| ---------- | ------------------- | -------------------------------------------------------- |
| `minimal`  | Production default  | Only errors (4xx/5xx) and critical warnings              |
| `normal`   | Development default | All HTTP requests, business events, errors               |
| `detailed` | Debugging/staging   | + Debug info, SQL queries, cache operations, user agents |
| `verbose`  | Deep debugging      | + Request/response bodies (sanitized), timing breakdowns |

#### Logger API

**Basic Usage (95% of logs):**

```typescript
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@/common/logger.service';

@Injectable()
export class UsersService {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('UsersService');
  }

  async createUser(data: CreateUserDto) {
    this.logger.info('Creating user', { email: data.email });

    try {
      const user = await this.prisma.user.create({ data });
      this.logger.info('User created successfully', { userId: user.id });
      return user;
    } catch (error) {
      this.logger.error('Failed to create user', error, { email: data.email });
      throw error;
    }
  }
}
```

**Explicit Verbosity Control (5% of logs):**

Use verbosity modifiers when you need fine-grained control:

```typescript
// Force log even in minimal mode (critical operations)
this.logger.verbose().info('Payment processed', { orderId, amount });

// Suppress noisy logs in normal development
this.logger.minimal().http('Health check passed');

// Show detailed debug info when investigating
this.logger.detailed().debug('Cache lookup', { key, hit: true });
```

**Log Methods:**

- `logger.info(message, context?)` - Standard information (shown in normal+)
- `logger.error(message, error?, context?)` - Errors with automatic Error serialization (always shown)
- `logger.warn(message, context?)` - Warnings (always shown)
- `logger.debug(message, context?)` - Debug information (shown in detailed+)
- `logger.http(message, context?)` - HTTP requests (shown in normal+)

**Verbosity Modifiers (chainable):**

- `logger.minimal()` - Only critical logs
- `logger.normal()` - Standard logs
- `logger.detailed()` - Include debug info
- `logger.verbose()` - Everything

#### Request ID Tracking

Every request automatically gets a unique ID tracked across the entire request lifecycle:

```typescript
// Request ID is automatically injected into logs
this.logger.info('Processing order', { orderId: 123 });
// Output: { reqId: "req-abc-123", context: "OrderService", orderId: 123, msg: "Processing order" }

// Request ID is also returned in response headers
// X-Request-ID: req-abc-123

// Client can provide request ID for distributed tracing
// curl -H "X-Request-ID: trace-xyz" http://localhost:8080/orders
```

Request IDs enable:

- Tracing a single request through logs
- Correlating frontend errors with backend logs
- Debugging distributed systems
- Production issue investigation

#### Structured Logging Best Practices

**DO:**

```typescript
// ✅ Structured context
this.logger.info('User login successful', {
  userId,
  email,
  loginMethod: 'oauth',
});

// ✅ Proper error serialization
this.logger.error('Database query failed', error, { query: 'SELECT users' });

// ✅ Child loggers for context
const childLogger = this.logger.child('PaymentProcessor');
childLogger.info('Processing payment');

// ✅ Explicit verbosity for noisy operations
this.logger.minimal().http('GET /health');
```

**DON'T:**

```typescript
// ❌ String concatenation
this.logger.info(`User ${userId} logged in with ${email}`);

// ❌ Logging sensitive data
this.logger.info('User credentials', { password: user.password }); // Use sanitization!

// ❌ Using console.log
console.log('Something happened'); // Always use LoggerService

// ❌ Excessive logging in hot paths
for (const item of items) {
  this.logger.debug('Processing item', { item }); // Use minimal() or remove
}
```

#### Log Output Examples

**Development (LOG_LEVEL=normal):**

```
12:34:56 INFO  [UsersService] User created successfully
  userId: 123
  email: "user@example.com"
  reqId: "req-abc-123"
```

**Production (LOG_LEVEL=minimal):**

```json
{
  "level": "info",
  "time": 1678901234567,
  "reqId": "req-abc-123",
  "context": "UsersService",
  "userId": 123,
  "email": "user@example.com",
  "msg": "User created successfully"
}
```

#### When to Use Each Verbosity Level

**In Controllers:**

```typescript
@Controller('users')
export class UsersController {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('UsersController');
  }

  @Get(':id')
  getUser(@Param('id') id: string) {
    // HTTP logging is automatic via middleware
    // Only log business-critical events
    this.logger.info('User data retrieved', { userId: id });
  }
}
```

**In Services:**

```typescript
@Injectable()
export class UsersService {
  // Normal: Business operations
  this.logger.info('User created', { userId });

  // Detailed: Debugging flows
  this.logger.detailed().debug('Checking user permissions', { userId, role });

  // Minimal: Critical errors only
  this.logger.minimal().error('Payment gateway down', error);

  // Verbose: Deep debugging
  this.logger.verbose().debug('API response', { body, headers });
}
```

**In Middleware/Guards:**

```typescript
@Injectable()
export class AuthGuard {
  // Use minimal() to avoid polluting logs
  this.logger.minimal().http('Auth check passed');

  // Only log auth failures (security-relevant)
  this.logger.warn('Authentication failed', { ip, reason });
}
```

#### Database Query Logging

Prisma queries are automatically logged based on `LOG_LEVEL`:

- **minimal/normal**: Only errors and warnings
- **detailed/verbose**: All queries with duration

```typescript
// Prisma automatically logs slow queries (>1s) even in production
// No manual logging needed for DB operations
```

#### Sensitive Data Sanitization

HTTP middleware automatically redacts sensitive fields:

- `password`, `token`, `secret`, `authorization`, `cookie`, `api_key`, `accessToken`, `refreshToken`

**Custom sanitization:**

```typescript
const sanitize = (data: unknown) => {
  // Your sanitization logic
  return sanitizedData;
};

this.logger.verbose().info('Request body', { body: sanitize(req.body) });
```

#### Production Debugging Workflow

When investigating production issues:

1. **Find the request ID** from error reports or user complaints
2. **Search logs** for that request ID: `grep "req-abc-123" logs.json`
3. **Temporarily increase verbosity** (if needed): Set `LOG_LEVEL=detailed` and restart
4. **Reproduce the issue** and collect detailed logs
5. **Reduce verbosity** back to `minimal` after debugging

**IMPORTANT**: Never leave `LOG_LEVEL=verbose` in production - it logs request/response bodies and impacts performance.

### Type Safety & Validation

The codebase emphasizes runtime and compile-time type safety with Zod v4 as the single validation library across the entire stack:

- **Schema-First Approach**: Zod v4 schemas in `shared/types` serve as single source of truth
- **Type Inference**: Types are inferred from schemas using `z.infer<typeof Schema>`
- **Runtime Validation**: All user input (API requests, env vars) validated at runtime
- **Automatic API Documentation**: OpenAPI schemas generated from Zod schemas
- **Consistency**: All packages use Zod v4.1.12 for validation
- **No Dual Systems**: We DO NOT use class-validator - only Zod everywhere

#### API Request Validation with Zod (Backend)

The backend uses `nestjs-zod` for automatic request validation via NestJS pipes:

**Step 1: Define Schemas in `shared/types`**

```typescript
// shared/types/src/index.ts
import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

export type CreateUser = z.infer<typeof CreateUserSchema>;

export const QueryUsersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'email', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type QueryUsers = z.infer<typeof QueryUsersSchema>;
```

**Step 2: Create DTO Classes in Controller**

```typescript
// apps/backend/src/modules/users/users.controller.ts
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateUserSchema,
  QueryUsersSchema,
  type User,
} from '@repo/shared-types';
import { createZodDto } from 'nestjs-zod';

import { UsersService } from '@/modules/users/users.service';

// Create DTO classes from Zod schemas
class CreateUserDto extends createZodDto(CreateUserSchema) {}
class QueryUsersDto extends createZodDto(QueryUsersSchema) {}

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated users with filtering' })
  @ApiResponse({ status: 200, description: 'Returns paginated users' })
  getUsers(@Query() query: QueryUsersDto): PaginatedResponse<User> {
    // query is automatically validated and transformed
    return this.usersService.getUsers(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  createUser(@Body() dto: CreateUserDto): ApiResponse<User> {
    // dto is automatically validated
    return this.usersService.createUser(dto);
  }
}
```

**Step 3: Global Validation Pipe (Already Configured)**

```typescript
// apps/backend/src/main.ts
import { ZodValidationPipe } from 'nestjs-zod';

app.useGlobalPipes(new ZodValidationPipe());
```

**Validation Features:**

- ✅ **Automatic Validation**: All `@Body()`, `@Query()`, `@Param()` automatically validated
- ✅ **Type Coercion**: Query params like `?page=1` automatically coerced to numbers
- ✅ **Default Values**: Missing optional fields filled with defaults
- ✅ **Detailed Errors**: Validation failures return structured error responses
- ✅ **OpenAPI Integration**: Swagger docs automatically show validation rules
- ✅ **Shared Validation**: Frontend can use same schemas for client-side validation

**Error Response Format:**

```json
{
  "success": false,
  "message": "Validation failed",
  "statusCode": 400,
  "errors": [
    {
      "code": "invalid_format",
      "format": "email",
      "path": ["email"],
      "message": "Invalid email address"
    }
  ],
  "timestamp": "2025-10-13T08:29:44.635Z",
  "path": "/users"
}
```

**When to Use Shared Schemas vs Backend-Only:**

- **Shared (`shared/types`)**: User-facing operations, forms frontend validates, public API payloads
- **Backend-Only**: Internal operations, admin endpoints, complex backend-specific logic

**IMPORTANT**: Always define Zod schemas first, then infer types - never the opposite

## Coding Standards

### Code Style

- TypeScript strict mode enabled across all packages
- **Type Definitions**: Prefer `interface` for public-facing types and object shapes, `type` for unions, intersections, and computed types
- Use descriptive variable names with auxiliary verbs (`isLoading`, `hasError`, `canSubmit`)
- Favor iteration and modularization over code duplication
- **IMPORTANT**: Avoid writing comments in code unless absolutely necessary for non-obvious edge cases - code should be self-documenting
- Use functional components with TypeScript interfaces
- Follow atomic design principles for UI components
- Prefer composition over inheritance
- Use async/await everywhere with proper error handling

### Import Aliases

**IMPORTANT**: Always use import aliases for local files. This is a strict requirement.

**Frontend (Next.js):**

```typescript
// ✅ CORRECT - Use @/* alias
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { env } from '@/lib/env';

// ❌ WRONG - Never use relative paths
import { Button } from '../../components/ui/button';
import { api } from '../lib/api';
```

**Backend (NestJS):**

```typescript
// ✅ CORRECT - Use @/* alias
import { AppService } from '@/app.service';
import { UsersService } from '@/modules/users/users.service';
import { PrismaService } from '@/database/prisma/prisma.service';
import { LoggerMiddleware } from '@/common/middleware/logger.middleware';

// ❌ WRONG - Never use relative paths
import { AppService } from './app.service';
import { UsersService } from '../modules/users/users.service';
```

**Shared Packages:**

```typescript
// ✅ CORRECT - Use workspace package names
import { UserSchema } from '@repo/shared-types';
import { formatDate } from '@repo/shared-utils';
import { loadEnv } from '@repo/shared-config';
```

### Import Order

ESLint is configured with `simple-import-sort` to automatically organize imports:

1. External packages (React, Next.js, etc.)
2. Workspace packages (@repo/\*)
3. Absolute imports (@/\*)
4. Relative imports (only when absolutely necessary)

### Naming Conventions

- **Directories**: Use kebab-case for folders (e.g., `user-profile/`, `api-client/`, `quiz-form/`)
- **Components**: Use PascalCase (e.g., `UserProfile.tsx`, `QuizForm.tsx`)
- **Variables/Functions**: Use camelCase (e.g., `getUserData`, `isLoading`)
- **Custom Hooks**: Prefix with `use` (e.g., `useUserData`, `useQuizState`)
- **Exports**: Favor default export for components and named exports for utilities
- **Types/Interfaces**: Use PascalCase with descriptive names

### File Organization

- Group related files by domain/feature
- Use kebab-case for all directories
- Co-locate state management files with components when domain-specific
- Keep API route handlers thin - delegate to services for business logic
- **NEVER create `index.ts` barrel files** - Always use direct imports with explicit paths
  - ❌ WRONG: `import { UsersListExample } from '@/components/examples'` (requires index.ts)
  - ✅ CORRECT: `import { UsersListExample } from '@/components/examples/users-list-example'`
  - Reason: Index files add unnecessary abstraction, can cause circular dependencies, and make imports less explicit

## Frontend Architecture Patterns

### State Management

The frontend uses a hybrid state management approach:

- **TanStack Query (React Query)**: For server state, API calls, and data synchronization
  - All API calls wrapped in custom hooks (`useFetch*`, `useGet*` for queries)
  - Mutations use `useCreate*`, `useUpdate*`, `useDelete*` patterns
  - Automatic caching, background refetching, and query invalidation
- **Jotai**: For client-side global state (UI state, user preferences)
  - Atoms defined in `apps/frontend/src/lib/states/`
  - Use `useAtom`, `useAtomValue`, `useSetAtom` for atom access

### API Integration

- API configuration centralized in `apps/frontend/src/lib/api/`
- **IMPORTANT**: Always use custom hooks for API calls - never call API directly in components
- Implement optimistic updates for better UX
- Handle loading states and errors gracefully
- Always define TypeScript types for API payloads and responses

### UI Component Patterns

- Use Shadcn UI components as base, extend them before creating custom ones
- Tailwind CSS for all styling with project theme
- Implement thoughtful micro-interactions and hover states
- Use Framer Motion for meaningful animations
- Use Lucide React for all icons
- Prefer `Skeleton` components for loading states instead of spinners
- Favor named exports for components

## Backend Architecture Patterns

### NestJS Structure

NestJS follows a layered architecture pattern:

- **Controllers**: Handle HTTP requests and responses, keep them thin
- **Services**: Contain business logic and orchestrate data operations
- **DTOs (Data Transfer Objects)**: Created from Zod schemas using `createZodDto()` from `nestjs-zod`
- **Guards**: Implement authentication and authorization logic
- **Interceptors**: Handle cross-cutting concerns (logging, transformations, timing)
- **Middleware**: Process requests before they reach route handlers
- **Dependency Injection**: Use constructor injection for all services and dependencies

**Production Structure:**

```
backend/src/
├── app.module.ts           # Root application module
├── app.controller.ts       # Root endpoints (/, /health)
├── app.service.ts          # Application-level services
├── main.ts                 # Application bootstrap
│
├── modules/                # Feature modules
│   └── users/             # Example: User management module
│       ├── users.module.ts        # Module definition
│       ├── users.controller.ts    # HTTP route handlers
│       ├── users.service.ts       # Business logic
│       └── *.spec.ts              # Unit tests
│
├── database/               # Database layer
│   └── prisma/            # Prisma ORM
│       ├── prisma.module.ts
│       ├── prisma.service.ts
│       └── schema.prisma
│
└── common/                 # Shared utilities
    ├── filters/           # Exception filters
    ├── guards/            # Authentication guards
    ├── interceptors/      # HTTP interceptors
    ├── middleware/        # Request middleware
    ├── decorators/        # Custom decorators
    └── *.service.ts       # Shared services (logger, etc.)
```

**Key Principles:**

- Feature modules go in `modules/` (e.g., `modules/users/`, `modules/auth/`)
- Each module is self-contained with controller, service, and tests
- Infrastructure (database, logging) stays separate from business logic
- Common utilities are grouped by type (filters, guards, middleware)

**Note**: Zod schemas are defined in `shared/types`, not in backend `dto/` folders. DTO classes are created inline in controllers using `createZodDto()`.

### Error Handling

- Use NestJS exception filters for consistent error responses
- Return appropriate HTTP status codes (400, 401, 403, 404, 500, etc.)
- Provide user-friendly error messages (avoid leaking implementation details)
- Log errors server-side for debugging
- Use built-in exceptions: `BadRequestException`, `UnauthorizedException`, `NotFoundException`, etc.

## Development Workflow

### Initial Setup

1. Install dependencies: `pnpm install`
2. Start PostgreSQL: `docker-compose up -d`
3. Set up environment variables:
   ```bash
   cp apps/frontend/.env.local.example apps/frontend/.env.local
   cp apps/backend/.env.local.example apps/backend/.env.local
   cp apps/backend/.env.local.example apps/backend/.env  # For Prisma
   ```
4. Run database migrations: `cd apps/backend && pnpm db:migrate`
5. Start development: `pnpm dev` (runs all apps concurrently)

### Development Best Practices

- **Frontend runs on**: `localhost:3000`
- **Backend runs on**: `localhost:8080`
- **API documentation**: Available at `http://localhost:8080/docs` (Swagger + Scalar)
- **Database GUI**: pgAdmin at `http://localhost:5050` or use `pnpm db:studio` from backend
- Pre-commit hooks (via Husky and lint-staged) automatically format and lint changed files
- **IMPORTANT**: Do not run `pnpm build` during active development - only for production builds

## Performance Best Practices

- Implement loading states for all async operations
- Use React Query caching strategically
- Optimize bundle size with dynamic imports for large components
- Leverage Turborepo caching for faster builds
- Use TypeScript for compile-time checks to catch errors early

## Common Troubleshooting

### State Management

- Check that queries are properly invalidated after mutations

### Build Issues

- Ensure all TypeScript types are properly defined
- Run `pnpm typecheck` to catch type errors
- Verify shared packages are built before apps: `pnpm build`
- Check that environment variables are properly configured

### Important Notes

- If you are unsure about anything, ask the user for clarification. I cannot stress this enough.
- Prefer using commands or exec scripts (like pnpm dlx) for setup related tasks instead of making all the files manually. In case the command requires interactive input, ask the user to do it themselves and provide them with suitable guidance.
- Make sure you aggressively prefer planning and waiting for user confirmation before writing code for medium to major tasks.
- Always be unbiased towards the code, the user's preference and opinion. If you do not strongly agree with the user, make it clear with them.
- Always mention alternative approaches to the user if you think it's necessary.
- Always be honest with the user. Do not lie to them.
- Do not be afraid of hurting the user's feelings or making them feel bad about their skills.
- Never create markdown files unless the user explicitly asks for it.
