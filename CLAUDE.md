# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**AI Assistant Context:**
You are a Senior Full-stack Developer and an Expert in TypeScript, Next.js 15, React 19, NestJS, Prisma, PostgreSQL, TailwindCSS, and modern UI/UX frameworks like Shadcn UI. You are collaborating with a human developer on a production-ready full-stack application.

## Project Overview

Production-ready TypeScript monorepo using pnpm workspaces and Turborepo, featuring a Next.js frontend and NestJS backend with shared packages for types, utilities, and configuration.

## Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Docker (for local PostgreSQL)

## Quick Start

```bash
pnpm install          # Install dependencies
pnpm init:project     # Automated setup (env files, Docker, migrations)
pnpm dev              # Start all applications
```

The `pnpm init:project` command automates the entire setup process:

- Checks prerequisites (Node.js, pnpm, Docker)
- Copies `.env.local` files (if they don't exist)
- Starts Docker Compose (PostgreSQL + pgAdmin)
- Waits for PostgreSQL to be healthy
- Runs database migrations
- Optionally seeds the database

**Safe to run multiple times** - skips completed steps automatically.

## Common Commands

### Development

```bash
pnpm init:project     # Run automated setup (first time or to fix issues)
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

### Shared Packages

All shared packages (`@repo/packages-types`, `@repo/packages-utils`) are consumed as workspace dependencies:

- Export both CJS and ESM formats
- Include TypeScript declarations
- Must be built before apps can run in dev mode
- Frontend's `next.config.ts` transpiles these packages
- Both use Zod v4.1.12 for validation

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
docker-compose up -d                        # Start PostgreSQL only
docker-compose down                         # Stop services
docker-compose down -v                      # Stop and wipe data
docker-compose --profile tools up -d        # Start PostgreSQL + pgAdmin (optional)
```

- **PostgreSQL**: `localhost:5432` (credentials in `docker-compose.yml`)
- **Prisma Studio**: `http://localhost:5555` - Run `pnpm db:studio` for database GUI (recommended)
- **pgAdmin** (optional): `http://localhost:5050` (admin@example.com / admin123) - Only for advanced PostgreSQL administration

**Environment Variables:**

- Backend uses `.env.local` for all environment variables (via dotenv-flow)
- Prisma CLI commands are wrapped with `dotenv-cli` to read from `.env.local`
- All database commands automatically load `.env.local` (see `apps/backend/package.json`)
- `DATABASE_URL` must match Docker credentials: `postgresql://postgres:postgres_dev_password@localhost:5432/app_dev?sslmode=disable`

**Turborepo Integration:**

- `pnpm dev` automatically runs `db:generate` before starting the backend
- Ensures Prisma Client is available before NestJS starts

### Environment Configuration

Environment variables are managed per-app with Zod validation:

- **Backend**: Custom env loader with `dotenv-flow` and Zod v4 validation
  - Configuration: `apps/backend/src/config/env.ts`
  - Required: `NODE_ENV`, `API_URL`, `FRONTEND_URL`, `DATABASE_URL`, `PORT`, `LOG_LEVEL`
  - Uses `loadEnv()` helper that validates env vars on startup
  - Reads from `apps/backend/.env.local` via `dotenv-flow`
- **Frontend**: Next.js environment variables with Zod validation
  - Configuration: `apps/frontend/src/lib/env.ts`
  - Required: `NEXT_PUBLIC_API_URL`, `NODE_ENV`
  - Only `NEXT_PUBLIC_*` variables are exposed to the browser
  - Next.js automatically loads env files (no dotenv-flow needed)
- Each app has `.env.local.example` files showing expected variables

### Security

Backend security middleware configured in `main.ts`:

- **Helmet**: Secure HTTP headers with dev-friendly CSP settings
- **Rate Limiting**: 30 requests per 60 seconds per IP via @nestjs/throttler
- **CORS**: Strict origin policy allowing only `FRONTEND_URL`
- ThrottlerGuard is applied globally to all routes

**Authentication & Session Security:**

- **Better Auth**: Modern authentication library with built-in CSRF protection
  - Session tokens stored in httpOnly cookies (protected from XSS)
  - Automatic CSRF validation for state-changing operations
  - Trusted origins validation via `trustedOrigins` config
  - No additional CSRF middleware needed - handled by Better Auth
- **Session Management**: Users can view and revoke active sessions
  - `GET /sessions` - List all active sessions with device info
  - `DELETE /sessions/:id` - Revoke specific session
  - `DELETE /sessions` - Sign out from all other devices
- **Password Security**: Password changes automatically invalidate all other sessions
  - `POST /password/change` - Change password with current password verification
  - Uses bcryptjs for password hashing
  - Prevents reuse of current password

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
} from '@repo/packages-types';
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
import { UserSchema } from '@repo/packages-types';
import { formatDate } from '@repo/packages-utils';
```

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

### Authentication & Protected Routes

The frontend uses Better Auth React client for authentication with modern patterns:

- **Auth Client**: Configured in `apps/frontend/src/lib/auth.ts`
  - Uses Better Auth's `createAuthClient` with admin plugin
  - Provides `useSession()` hook for accessing current user/session
  - Handles sign in/out, session persistence via cookies
- **Protected Routes**: Two approaches available
  - `<ProtectedRoute>` wrapper component for page-level protection
  - `withAuth()` HOC for functional component wrapping
  - Both provide automatic redirects and loading states
  - Example: `<ProtectedRoute redirectTo="/login">{children}</ProtectedRoute>`
- **Session Management**: Full device/session management UI
  - View active sessions with device info (IP, user agent, timestamps)
  - Revoke individual sessions or sign out from all devices
  - Available at `/dashboard/sessions`

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

**Key Principles:**

- Feature modules go in `modules/` (e.g., `modules/users/`, `modules/auth/`)
- Each module is self-contained with controller, service, and tests
- Infrastructure (database, logging) stays separate from business logic
- Common utilities grouped by type in `common/` (filters, guards, middleware, interceptors, decorators)
- Zod schemas defined in `shared/types`, DTO classes created inline in controllers using `createZodDto()`

### Error Handling

- Use NestJS exception filters for consistent error responses
- Return appropriate HTTP status codes (400, 401, 403, 404, 500, etc.)
- Provide user-friendly error messages (avoid leaking implementation details)
- Log errors server-side for debugging
- Use built-in exceptions: `BadRequestException`, `UnauthorizedException`, `NotFoundException`, etc.

## Important Notes

- If you are unsure about anything, ask the user for clarification. I cannot stress this enough.
- Prefer using commands or exec scripts (like pnpm dlx) for setup related tasks instead of making all the files manually. In case the command requires interactive input, ask the user to do it themselves and provide them with suitable guidance.
- Make sure you aggressively prefer planning and waiting for user confirmation before writing code for medium to major tasks.
- Always be unbiased towards the code, the user's preference and opinion. If you do not strongly agree with the user, make it clear with them.
- Always mention alternative approaches to the user if you think it's necessary.
- Always be honest with the user. Do not lie to them.
- Do not be afraid of hurting the user's feelings or making them feel bad about their skills.
- Never create markdown files unless the user explicitly asks for it.
- Always give a brief and compact summary of all the changes done.
