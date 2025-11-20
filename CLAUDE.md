# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**AI Assistant Context:**
You are a Senior Full-stack Developer and an Expert in TypeScript, Next.js 15, React 19, Fastify, Prisma, PostgreSQL, TailwindCSS, and modern UI/UX frameworks like Shadcn UI. You are collaborating with a human developer on a production-ready full-stack application.

## Project Overview

Production-ready TypeScript monorepo using pnpm workspaces and Turborepo, featuring a Next.js frontend and Fastify API with shared packages for types and utilities.

---

## Common Commands

### Development

```bash
pnpm init:project     # Run automated setup (first time or to fix issues)
pnpm dev              # Start all applications (stream mode - default)
pnpm build            # Build all packages and applications
pnpm typecheck        # Type check all packages
pnpm test             # Run tests
pnpm test:unit        # Run unit tests
pnpm test:integration # Run integration tests
pnpm test:coverage    # Generate coverage report
pnpm lint             # Lint all packages
pnpm lint:fix         # Lint and auto-fix all packages
```

### Individual Package Commands

```bash
# Frontend (Next.js on port 3000)
cd apps/frontend
pnpm dev              # Start Next.js dev server
pnpm typecheck        # Type check only

# API (Fastify on port 8080)
cd apps/api
pnpm dev              # Start Fastify with hot reload (tsx watch)
pnpm start            # Run production build

# packages (types, utils)
cd packages/{package}
pnpm dev              # Watch mode with tsup
```

---

## Project Architecture

### Packages

All packages (`@repo/packages-types`, `@repo/packages-utils`) are consumed as workspace dependencies:

- Run in watch mode during development
- Frontend's `next.config.ts` transpiles these packages on-the-fly

### Database (Prisma + PostgreSQL)

The API uses Prisma 6 as the ORM with PostgreSQL:

- Schema: Located in `apps/api/prisma/schema.prisma`
- Client: Generated to `apps/api/node_modules/.prisma/client`
- Migrations: Stored in `apps/api/prisma/migrations/`
- Database Plugin: Fastify plugin in `apps/api/src/plugins/database.ts`

**Database Commands (run from `apps/api`):**

```bash
pnpm db:generate    # Generate Prisma Client
pnpm db:migrate     # Create and apply migrations
pnpm db:push        # Push schema changes (no migration files)
pnpm db:studio      # Open Prisma Studio UI
pnpm db:seed        # Seed database
```

**Environment Variables:**

- API uses `.env.local` for all environment variables (via dotenv-flow)
- Prisma CLI commands are wrapped with `dotenv-cli` to read from `.env.local`

### Environment Configuration

Environment variables are managed per-app with Zod validation

- **API**: Custom env loader with `dotenv-flow` and Zod v4 validation
  - Configuration: `apps/api/src/config/env.ts`
- **Frontend**: Next.js environment variables with Zod validation
  - Configuration: `apps/frontend/src/lib/env.ts`
  - Only `NEXT_PUBLIC_*` variables are exposed to the browser
- Each app has `.env.local.example` files showing expected variables

### Security

- API security middleware configured in `main.ts`:
- Authentication and session management is handled by Better Auth

### Production Logging & Error Tracking

- The API uses Pino for structured logging with request tracing.
- Important: Never use `console.log` for logging. Use the logger service instead.
- Ensure a single unified logging pattern throughout the codebase.
- Prisma queries are automatically logged based on `LOG_LEVEL`

**Logging Verbosity:**

- Minimal: Only errors (4xx/5xx) and critical warnings
- Normal: All HTTP requests, business events, errors
- Detailed: Debug info, SQL queries, cache operations, user agents
- Verbose: Request/response bodies (sanitized), timing breakdowns

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
```

**DON'T:**

```typescript
// ❌ String concatenation
this.logger.info(`User ${userId} logged in with ${email}`);

// ❌ Logging sensitive data
this.logger.info('User credentials', { password: user.password });
```

### Type Safety & Validation

The codebase emphasizes runtime and compile-time type safety with Zod v4 as the single validation library across the entire stack:

- Schema-First Approach: Zod v4 schemas in `packages/types` serve as single source of truth
- Type Inference: Types are inferred from schemas using `z.infer<typeof Schema>`
- Runtime Validation: All user input (API requests, env vars) validated at runtime
- Automatic API Documentation: OpenAPI schemas generated from Zod schemas
- Consistency: All packages use Zod v4.1.12 for validation
- No Dual Systems: We DO NOT use class-validator - only Zod everywhere

**Validation Features:**

- Automatic Validation: All route schemas (body, querystring, params) automatically validated
- Type Coercion: Query params like `?page=1` automatically coerced to numbers
- Default Values: Missing optional fields filled with defaults
- Detailed Errors: Validation failures return structured error responses
- OpenAPI Integration: Swagger docs automatically show validation rules
- Shared Validation: Frontend can use same schemas for client-side validation

### Testing

#### Test Types

**Unit Tests** (`*.spec.ts`):

- Use mocked dependencies (Prisma, Logger, etc.)
- Located alongside source files: `src/**/*.spec.ts`

**Integration Tests** (`*.integration.spec.ts`):

- Use real PostgreSQL test database
- Test actual database operations and transactions
- Located in `test/integration/`

#### Test Database Setup

Integration tests automatically use a separate test database (`app_dev_test`):

1. Automatic Setup: Test database is created and migrated automatically in `test/setup.ts`
2. Database URL: Appends `_test` suffix to your `DATABASE_URL` (e.g., `app_dev` → `app_dev_test`)
3. Migrations: Runs `pnpm prisma migrate deploy` before tests
4. Cleanup: Database is dropped after tests (unless `KEEP_TEST_DB=true`)

**Test Isolation:**

- Each test file has a global `beforeEach` that resets the database
- Nested describe blocks can have additional setup in their own `beforeEach`
- `resetTestDatabase()` truncates all tables efficiently using `TRUNCATE ... CASCADE`
- Tests run sequentially (`fileParallelism: false`) to avoid database conflicts

**Better Auth Integration:**

- When creating test users with password auth, set `accountId` to the user's email (not user.id)
- Better Auth uses `providerId: 'credential'` for email/password accounts

---

## Coding Standards

### Code Style

- TypeScript strict mode enabled across all packages
- Type Definitions: Prefer `interface` for public-facing types and object shapes, `type` for unions, intersections, and computed types
- Use descriptive variable names with auxiliary verbs (`isLoading`, `hasError`, `canSubmit`)
- Favor iteration and modularization over code duplication
- Use functional components with TypeScript interfaces
- Follow atomic design principles for UI components
- Prefer composition over inheritance
- Use async/await everywhere with proper error handling
- **IMPORTANT**: Always use import aliases for local files
- **IMPORTANT**: Avoid writing comments in code unless absolutely necessary for non-obvious edge cases - code should be self-documenting

### Import Aliases

**Frontend (Next.js) Example:**

```typescript
// ✅ CORRECT - Use @/* alias
import { Button } from '@/components/ui/button';
// ❌ WRONG - Never use relative paths
import { Button } from '../../components/ui/button';
```

### Naming Conventions

- **Directories**: Use kebab-case for folders (e.g. `user-profile`)
- **Components**: Use PascalCase (e.g., `DetailsDialog.tsx`)
- **Variables/Functions**: Use camelCase (e.g., `getUserData`, `isLoading`)
- **Types/Interfaces**: Use PascalCase with descriptive names (e.g., `DataItem`)
- **Custom Hooks**: Prefix with `use` (e.g., `useUserData`)
- **Exports**: Favor default export for pages and named exports for utilities

### File Organization

- Group related files by domain/feature
- Use kebab-case for all directories
- Co-locate state management files with components when domain-specific
- Keep API route handlers thin - delegate to services for business logic
- **NEVER create `index.ts` barrel files**. This is a strict requirement.

---

## Frontend Architecture Patterns

### State Management

- **TanStack Query (React Query)**: For API calls and data synchronization
  - All API calls wrapped in custom hooks (`useFetch*`, `useGet*` for queries)
  - Mutations use `useCreate*`, `useUpdate*`, `useDelete*` patterns
  - Automatic caching, background refetching, and query invalidation
- Jotai: For client-side global state (UI state, user preferences)

### API Integration

- API configuration centralized in `apps/frontend/src/lib/api.ts`
- Prefer implementing optimistic updates for better UX
- Handle loading states and errors gracefully

**API Response Unwrapping:** The `api.ts` fetcher unwraps `{ data: T }` to `T` but preserves `{ data: T[], pagination: {...} }` responses intact.

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

### UI Component Patterns

- Use Shadcn UI components as base, extend them before creating custom ones
- Tailwind CSS for all styling with project theme
- Implement thoughtful micro-interactions and hover states wherever needed
- Use Framer Motion for animations
- Use Lucide React for all icons
- Favor named exports for components
- Prefer using `Skeleton` components for loading states instead of spinners (especially for data fetching components)

---

## API Architecture Patterns

### Fastify Structure

The Fastify API follows a plugin-based architecture:

- Route Handlers: Handle HTTP requests and responses, keep them thin (in `src/routes/`)
- Services: Contain business logic and orchestrate data operations (in `src/services/`)
- Plugins: Encapsulate functionality and extend Fastify (in `src/plugins/`)
- Hooks: Fastify lifecycle hooks for auth, logging, etc. (in `src/hooks/`)
- Validation: Zod schemas directly in route definitions via `fastify-type-provider-zod`
- Dependency Injection: Manual DI via Fastify decorators (`app.decorate()` for services)

**Key Principles:**

- Route handlers organized by feature in `routes/` (e.g., `routes/users.ts`)
- Each route file exports a Fastify plugin with related endpoints
- Common utilities in `common/` (logger service, types, utilities)

### Error Handling

- Use our custom error classes from `packages/utils/src/errors.ts`
- Use appropriate HTTP status codes (400, 401, 403, 404, 500, etc.)
- Provide user-friendly error messages while avoiding leaking implementation details
- Log errors server-side for debugging

---

## Important Notes

- If you are unsure about anything, ask the user for clarification. This is a strict requirement
- Prefer using commands or exec scripts (like `pnpm dlx`) for setup related tasks instead of making all the files manually. In case the command requires interactive input, ask the user to do it themselves and provide them with suitable guidance
- Make sure you aggressively prefer planning and waiting for user confirmation before writing code for medium to big tasks. This is a strict requirement
- Always be unbiased towards the code, the user's preference and opinions. If you do not agree with the user, make it clear with them. Treat them like a peer
- Always mention alternative approaches to the user if you think it's necessary
- Do not be afraid of hurting the user's feelings or making them feel bad about their skills. Having well-written and maintainable code is significantly more important than cozying up to the user
- NEVER create markdown files unless the user explicitly asks for it. This is very important
- Always give a brief and compact summary of all the changes done
- Avoid writing comments in code unless absolutely necessary for non-obvious edge cases - code should be self-documenting
