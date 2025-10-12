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
- **PrismaService**: Global NestJS service in `apps/backend/src/prisma/`
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

### Type Safety

The codebase emphasizes runtime and compile-time type safety:

- Zod v4 schemas in `shared/types` serve as single source of truth
- Types are inferred from schemas using `z.infer<typeof Schema>`
- Environment variables are validated at runtime using Zod
- All packages use strict TypeScript settings from `tsconfig.base.json`
- All shared packages use Zod v4.1.12 for consistency

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
import { UserDto } from '@/users/dto/user.dto';

// ❌ WRONG - Never use relative paths
import { AppService } from './app.service';
import { UserDto } from '../users/dto/user.dto';
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
- **DTOs (Data Transfer Objects)**: Validate request/response payloads using Zod or class-validator
- **Guards**: Implement authentication and authorization logic
- **Interceptors**: Handle cross-cutting concerns (logging, transformations, timing)
- **Middleware**: Process requests before they reach route handlers
- **Dependency Injection**: Use constructor injection for all services and dependencies

**Recommended Structure:**

```
backend/src/
├── modules/           # Feature modules (users, auth, etc.)
│   ├── controllers/   # Route handlers
│   ├── services/      # Business logic
│   ├── dto/          # Data transfer objects
│   └── entities/     # Prisma models/types
├── common/           # Shared utilities, guards, interceptors
├── prisma/           # Prisma service
└── config/           # Configuration management
```

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
- Make sure you aggressively prefer planning and waiting for user confirmation before writing code for medium to major tasks.
