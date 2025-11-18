# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**AI Assistant Context:**
You are a Senior Full-stack Developer and an Expert in TypeScript, Next.js 15, React 19, Fastify, Prisma, PostgreSQL, TailwindCSS, and modern UI/UX frameworks like Shadcn UI. You are collaborating with a human developer on a production-ready full-stack application.

## Project Overview

Production-ready TypeScript monorepo using pnpm workspaces and Turborepo, featuring a Next.js frontend and Fastify API with shared packages for types, utilities, and configuration.

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
pnpm dev              # Start all applications in dev mode (frontend on :3000, api on :8080)
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

# API (Fastify on port 8080)
cd apps/api
pnpm dev              # Start Fastify with hot reload (tsx watch)
pnpm build            # Build production bundle (TypeScript → dist/)
pnpm start            # Run production build
# API docs available at http://localhost:8080/docs (Scalar UI)

# packages (types, utils)
cd packages/{package}
pnpm dev              # Watch mode with tsup
pnpm build            # Build with tsup
```

## Architecture

### Packages

All packages (`@repo/packages-types`, `@repo/packages-utils`) are consumed as workspace dependencies:

- Export both CJS and ESM formats
- Include TypeScript declarations
- Must be built before apps can run in dev mode
- Frontend's `next.config.ts` transpiles these packages
- Both use Zod v4.1.12 for validation

### Database (Prisma + PostgreSQL)

The API uses Prisma 6.17.1 as the ORM with PostgreSQL:

- **Schema**: Located in `apps/api/prisma/schema.prisma`
- **Client**: Generated to `apps/api/node_modules/.prisma/client`
- **Migrations**: Stored in `apps/api/prisma/migrations/`
- **Database Plugin**: Fastify plugin in `apps/api/src/plugins/database.ts`
  - Decorates Fastify instance with `app.prisma`
  - Lifecycle hooks (connect on start, disconnect on close)
  - Conditional query logging based on LOG_LEVEL

**Database Commands (run from `apps/api`):**

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

- API uses `.env.local` for all environment variables (via dotenv-flow)
- Prisma CLI commands are wrapped with `dotenv-cli` to read from `.env.local`
- All database commands automatically load `.env.local` (see `apps/api/package.json`)
- `DATABASE_URL` must match Docker credentials: `postgresql://postgres:postgres_dev_password@localhost:5432/app_dev`

**Turborepo Integration:**

- `pnpm dev` automatically runs `db:generate` before starting the API
- Ensures Prisma Client is available before Fastify starts

### Environment Configuration

Environment variables are managed per-app with Zod validation:

- **API**: Custom env loader with `dotenv-flow` and Zod v4 validation
  - Configuration: `apps/api/src/config/env.ts`
  - Required: `NODE_ENV`, `API_URL`, `FRONTEND_URL`, `DATABASE_URL`, `PORT`, `LOG_LEVEL`, `COOKIE_SECRET`
  - Uses `loadEnv()` helper that validates env vars on startup
  - Reads from `apps/api/.env.local` via `dotenv-flow`
- **Frontend**: Next.js environment variables with Zod validation
  - Configuration: `apps/frontend/src/lib/env.ts`
  - Required: `NEXT_PUBLIC_API_URL`, `NODE_ENV`
  - Only `NEXT_PUBLIC_*` variables are exposed to the browser
  - Next.js automatically loads env files (no dotenv-flow needed)
- Each app has `.env.local.example` files showing expected variables

### Security

API security middleware configured in `main.ts`:

- **Helmet**: Secure HTTP headers with dev-friendly CSP settings via `@fastify/helmet`
- **Rate Limiting**: 30 requests per 60 seconds per IP via `@fastify/rate-limit`
- **CORS**: Strict origin policy allowing only `FRONTEND_URL` via `@fastify/cors`
- **Cookies**: Secure cookie handling with `@fastify/cookie` (httpOnly, secure in prod)
- All security plugins registered globally in main.ts

**Authentication & Session Security:**

- **Better Auth**: Modern authentication library with built-in CSRF protection
  - Session tokens stored in httpOnly cookies (protected from XSS)
  - Automatic CSRF validation for state-changing operations
  - Trusted origins validation via `trustedOrigins` config
  - No additional CSRF middleware needed - handled by Better Auth
- **Session Management**: Users can view and revoke active sessions
  - `GET /api/sessions` - List all active sessions with device info
  - `DELETE /api/sessions/:id` - Revoke specific session
  - `DELETE /api/sessions` - Sign out from all other devices
- **Password Security**: Password changes automatically invalidate all other sessions
  - `POST /api/password/change` - Change password with current password verification
  - Uses bcryptjs for password hashing
  - Prevents reuse of current password

**OAuth Social Login (Optional):**

By default, the template uses email/password authentication. To enable OAuth providers (GitHub, Google, etc.):

1. **Get OAuth Credentials:**
   - GitHub: https://github.com/settings/developers (create OAuth App)
   - Google: https://console.cloud.google.com/apis/credentials (create OAuth 2.0 Client)

2. **Add to Environment Variables** (`apps/api/.env.local`):

   ```bash
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

3. **Enable in Better Auth Config** (`apps/api/src/plugins/auth.ts`):
   Uncomment the `socialProviders` section and configure:

   ```typescript
   socialProviders: {
     github: {
       clientId: env.GITHUB_CLIENT_ID!,
       clientSecret: env.GITHUB_CLIENT_SECRET!,
     },
     google: {
       clientId: env.GOOGLE_CLIENT_ID!,
       clientSecret: env.GOOGLE_CLIENT_SECRET!,
     },
   },
   ```

4. **Frontend Integration:**
   Better Auth React client automatically provides OAuth sign-in methods when enabled.

**Note**: OAuth credentials are optional - the app works perfectly with just email/password authentication.

### Production Logging & Error Tracking

The API uses Pino for structured, production-ready logging with request tracing and configurable verbosity.

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
import type { PrismaClient } from '@prisma/client';
import type { CreateUser } from '@repo/packages-types';

import { LoggerService } from '@/common/logger.service';

export class UsersService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext('UsersService');
  }

  async createUser(data: CreateUser) {
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
- Correlating frontend errors with API logs
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

**In Route Handlers:**

```typescript
import type { FastifyPluginAsync } from 'fastify';

const usersRoutes: FastifyPluginAsync = async (app) => {
  // GET /users/:id - Get user by ID
  app.get('/users/:id', async (request, reply) => {
    const { id } = request.params;

    // HTTP logging is automatic via hooks
    // Only log business-critical events
    request.logger.info('User data retrieved', { userId: id });

    return app.usersService.getUserById(id);
  });
};
```

**In Services:**

```typescript
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

**In Hooks/Middleware:**

```typescript
import type { FastifyRequest, FastifyReply } from 'fastify';

export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Use minimal() to avoid polluting logs
  request.logger.minimal().http('Auth check passed');

  // Only log auth failures (security-relevant)
  if (!session) {
    request.logger.warn('Authentication failed', {
      ip: request.ip,
      reason: 'No session',
    });
  }
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

- **Schema-First Approach**: Zod v4 schemas in `packages/types` serve as single source of truth
- **Type Inference**: Types are inferred from schemas using `z.infer<typeof Schema>`
- **Runtime Validation**: All user input (API requests, env vars) validated at runtime
- **Automatic API Documentation**: OpenAPI schemas generated from Zod schemas
- **Consistency**: All packages use Zod v4.1.12 for validation
- **No Dual Systems**: We DO NOT use class-validator - only Zod everywhere

#### API Request Validation with Zod (Fastify)

The API uses `fastify-type-provider-zod` for automatic request validation:

**Step 1: Define Schemas in `packages/types`**

```typescript
// packages/types/src/user.ts
import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: RoleSchema.default('user'),
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

**Step 2: Use Schemas Directly in Route Handlers**

```typescript
// apps/api/src/routes/users.ts
import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  CreateUserSchema,
  QueryUsersSchema,
  GetUserByIdSchema,
} from '@repo/packages-types';

const usersRoutes: FastifyPluginAsync = async (app) => {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // GET /api/users - Get paginated users with filtering
  server.get(
    '/users',
    {
      schema: {
        querystring: QueryUsersSchema,
        description: 'Get paginated users with filtering and sorting',
        tags: ['Users'],
      },
    },
    async (request) => {
      // request.query is automatically validated and typed
      return app.usersService.getUsers(request.query);
    }
  );

  // POST /api/users - Create a new user
  server.post(
    '/users',
    {
      schema: {
        body: CreateUserSchema,
        description: 'Create a new user',
        tags: ['Users'],
      },
    },
    async (request, reply) => {
      // request.body is automatically validated and typed
      const user = await app.usersService.createUser(request.body);
      return reply.status(201).send(user);
    }
  );
};

export default usersRoutes;
```

**Step 3: Setup Type Provider in main.ts (Already Configured)**

```typescript
// apps/api/src/main.ts
import {
  validatorCompiler,
  serializerCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod';

const app = Fastify().withTypeProvider<ZodTypeProvider>();
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
```

**Validation Features:**

- ✅ **Automatic Validation**: All route schemas (body, querystring, params) automatically validated
- ✅ **Type Coercion**: Query params like `?page=1` automatically coerced to numbers
- ✅ **Default Values**: Missing optional fields filled with defaults
- ✅ **Detailed Errors**: Validation failures return structured error responses
- ✅ **OpenAPI Integration**: Swagger docs automatically show validation rules
- ✅ **Shared Validation**: Frontend can use same schemas for client-side validation

**IMPORTANT**: Always define Zod schemas first, then infer types - never the opposite

### Testing

The codebase supports both unit tests (with mocks) and integration tests (with real database).

#### Test Types

**Unit Tests** (`*.spec.ts`):

- Use mocked dependencies (Prisma, Logger, etc.)
- Fast execution, no external dependencies
- Ideal for testing business logic in isolation
- Located alongside source files: `src/**/*.spec.ts`

**Integration Tests** (`*.integration.spec.ts`):

- Use real PostgreSQL test database
- Test actual database operations and transactions
- Verify end-to-end functionality
- Located in `test/integration/`

#### Test Database Setup

Integration tests automatically use a separate test database (`app_dev_test`):

1. **Automatic Setup**: Test database is created and migrated automatically in `test/setup.ts`
2. **Database URL**: Appends `_test` suffix to your `DATABASE_URL` (e.g., `app_dev` → `app_dev_test`)
3. **Migrations**: Runs `pnpm prisma migrate deploy` before tests
4. **Cleanup**: Database is dropped after tests (unless `KEEP_TEST_DB=true`)

**Running Tests:**

```bash
# Run all tests (unit + integration)
pnpm test

# Run only unit tests
pnpm test -- src/**/*.spec.ts

# Run only integration tests
pnpm test -- test/**/*.integration.spec.ts

# Keep test database after tests (for inspection)
KEEP_TEST_DB=true pnpm test

# Generate coverage report
pnpm test:coverage
```

#### Integration Test Example

```typescript
// test/integration/users.integration.spec.ts
import { getTestPrisma, resetTestDatabase } from '@test/helpers/test-db';
import { createMockLogger } from '@test/helpers/mock-logger';
import { beforeEach, describe, expect, it } from 'vitest';
import { UsersService } from '@/services/users.service';

describe('UsersService Integration Tests', () => {
  let service: UsersService;

  beforeEach(async () => {
    // Reset database between tests
    await resetTestDatabase();

    // Create service with real Prisma client
    const prisma = getTestPrisma();
    const logger = createMockLogger();
    service = new UsersService(prisma, logger);
  });

  it('should create and retrieve a user', async () => {
    const user = await service.createUser({
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
    });

    const retrieved = await service.getUserById(user.id);
    expect(retrieved?.email).toBe('test@example.com');
  });
});
```

#### Test Utilities

**Test Database Helpers** (`test/helpers/test-db.ts`):

- `getTestPrisma()` - Get Prisma client for test database
- `resetTestDatabase()` - Truncate all tables between tests
- `setupTestDatabase()` - Initialize test database (auto-called)
- `cleanupTestDatabase()` - Drop test database (auto-called)

**Mock Helpers** (`test/helpers/mock-*.ts`):

- `createMockPrisma()` - Mocked Prisma client for unit tests
- `createMockLogger()` - Mocked logger for all tests

#### Best Practices

- Use **unit tests** for business logic and edge cases
- Use **integration tests** for database operations and transactions
- Reset database between integration tests with `resetTestDatabase()`
- Keep test database for debugging with `KEEP_TEST_DB=true`
- Run integration tests sequentially (already configured in `vitest.config.ts`)

## Coding Standards

### Code Style

- TypeScript strict mode enabled across all packages
- **Type Definitions**: Prefer `interface` for public-facing types and object shapes, `type` for unions, intersections, and computed types
- Use descriptive variable names with auxiliary verbs (`isLoading`, `hasError`, `canSubmit`)
- Favor iteration and modularization over code duplication
- **IMPORTANT**: Avoid writing comments in code unless absolutely necessary for non-obvious edge cases - code should be self-documenting.
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

**API (Fastify):**

```typescript
// ✅ CORRECT - Use @/* alias
import { UsersService } from '@/services/users.service';
import { LoggerService } from '@/common/logger.service';
import { requireAuth } from '@/hooks/auth';
import { loadEnv } from '@/config/env';

// ❌ WRONG - Never use relative paths
import { UsersService } from './services/users.service';
import { requireAuth } from '../hooks/auth';
```

**Packages:**

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

## API Architecture Patterns

### Fastify Structure

The Fastify API follows a plugin-based architecture:

- **Route Handlers**: Handle HTTP requests and responses, keep them thin (in `src/routes/`)
- **Services**: Contain business logic and orchestrate data operations (in `src/services/`)
- **Plugins**: Encapsulate functionality and extend Fastify (in `src/plugins/`)
- **Hooks**: Fastify lifecycle hooks (`preHandler`, `onRequest`, `onResponse`) for auth, logging, etc. (in `src/hooks/`)
- **Validation**: Zod schemas directly in route definitions via `fastify-type-provider-zod`
- **Dependency Injection**: Manual DI via Fastify decorators (`app.decorate()` for services)

**Key Principles:**

- All API routes prefixed with `/api` for clear separation and reverse proxy compatibility
- Route handlers organized by feature in `routes/` (e.g., `routes/users.ts`, `routes/sessions.ts`)
- Each route file exports a Fastify plugin with related endpoints
- Services contain business logic and are injected via decorators
- Infrastructure plugins in `plugins/` (database, logger, auth, swagger, schedule)
- Common utilities in `common/` (logger service, types, utilities)
- Zod schemas defined in `packages/types`, used directly in route schemas
- Health check endpoint at `/health` (no prefix for monitoring tools)

### Error Handling

- Use Fastify's `setErrorHandler()` for consistent error responses
- Return appropriate HTTP status codes (400, 401, 403, 404, 500, etc.)
- Provide user-friendly error messages (avoid leaking implementation details)
- Log errors server-side for debugging
- Validation errors automatically formatted with Zod issue details

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
- Avoid writing comments in code unless absolutely necessary for non-obvious edge cases - code should be self-documenting.
