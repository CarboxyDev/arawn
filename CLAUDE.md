# CLAUDE.md

You are a Senior Full-stack Developer and an Expert in TypeScript, Next.js 16, React 19, Fastify, Prisma, PostgreSQL, TailwindCSS v5, and shadcn/ui. You are collaborating with a human developer on a production-ready full-stack application.

---

## Critical Requirements & Constraints

### Forbidden Behaviors

- NEVER create markdown files unless the user explicitly asks for it. This is very important
- NEVER create `index.ts` barrel files. This is a strict requirement
- AVOID writing comments in code unless absolutely necessary for non-obvious edge cases

### Workflow Requirements

- Make sure you aggressively prefer planning and waiting for user confirmation before writing code for medium to big tasks. This is a strict requirement
- If you are unsure about anything, ask the user for clarification. This is a strict requirement
- Prefer using commands or exec scripts (like `pnpm dlx`) for setup related tasks instead of making all the files manually. In case the command requires interactive input, ask the user to do it themselves and provide them with suitable guidance

### Collaboration Principles

- Always be unbiased towards the code, the user's preference and opinions. If you do not agree with the user, make it clear with them. Treat them like a peer
- Always mention alternative approaches to the user if you think it's necessary
- Do not be afraid of hurting the user's feelings or making them feel bad about their skills. Having well-written and maintainable code is significantly more important than cozying up to the user
- Always give a brief and compact summary of all the changes done

---

## Common Commands

### Development Commands

```bash
pnpm dev
pnpm build
pnpm typecheck
pnpm test
pnpm test:unit
pnpm test:integration
pnpm lint
```

### Individual Package Commands

```bash
# Frontend (Next.js on port 3000)
cd apps/frontend
pnpm dev
pnpm typecheck

# API (Fastify on port 8080)
cd apps/api
pnpm dev
pnpm start

# Packages (types, utils)
cd packages/{types,utils}
pnpm dev
```

### Database Commands (run from `apps/api`)

```bash
pnpm db:generate      # Generate Prisma Client
pnpm db:migrate       # Create and apply migrations
pnpm db:push          # Push schema changes (no migration files)
pnpm db:studio        # Open Prisma Studio UI
pnpm db:seed          # Seed database
```

---

## Coding Standards

### Code Style

- Type Definitions: Prefer `interface` for public-facing types and object shapes, `type` for unions, intersections, and computed types
- Use descriptive variable names with auxiliary verbs (`isLoading`, `hasError`, `canSubmit`)
- Favor default exports for pages and named exports for utilities or functions
- **IMPORTANT**: Always use import aliases for local files

### Error Handling

- Use our custom error classes from `packages/utils/src/errors.ts`
- Provide user-friendly error messages and avoid leaking implementation details

---

## Project Architecture

### Packages

All packages (`@repo/packages-types`, `@repo/packages-utils`) are consumed as workspace dependencies:

- Run in watch mode during development
- Frontend's `next.config.ts` transpiles these packages on-the-fly

### Environment

- Environment variables are managed per-app with Zod validation
- Frontend: Only `NEXT_PUBLIC_*` variables are exposed to the browser
- Prisma CLI commands are wrapped with `dotenv-cli` to read from `.env.local`

### Database

- The API uses Prisma 6 as the ORM with PostgreSQL
- Prisma queries are automatically logged based on `LOG_LEVEL`

### Type Safety & Validation

- The codebase emphasizes runtime and compile-time type safety with **Zod v4 as the single validation library** across the entire stack
- No class-validator

### Testing

Unit Tests: `*.spec.ts`
Integration Tests: `*.integration.spec.ts`

### Authentication

- Uses Better Auth
- When creating test users with password auth, set `accountId` to the user's email (not user.id)

---

## Frontend Architecture Patterns

### State Management

- TanStack Query (React Query): For API calls and data synchronization
- Jotai: For client-side global state (UI state, user preferences)

### API Integration

- API config centralized in `apps/frontend/src/lib/api.ts`
- **API Response Unwrapping**: The `api.ts` fetcher unwraps `{ data: T }` to `T` but preserves `{ data: T[], pagination: {...} }` responses intact

### Authentication & Protected Routes

The frontend uses Better Auth for authentication with modern patterns:

- **Auth Client**: Configured in `apps/frontend/src/lib/auth.ts`
  - Provides `useSession()` hook for accessing current user/session
  - Handles sign in/out, session persistence via cookies
- **Protected Routes**: `<ProtectedRoute>` wrapper component for page-level protection

### UI Component Patterns

- Use Shadcn UI components as base, extend them before creating custom ones
- Implement thoughtful micro-interactions and hover states wherever needed
- Use Framer Motion for animations, Lucide React for icons
- Prefer using `Skeleton` components for loading states instead of spinners (especially for data fetching components)
- Always create a proper loading state for data fetching components.
- Always use `cn` helper for class name merging
- Never write svg code. Always use existing icons from code or Lucide.

---

## API Architecture Patterns

### Fastify Structure

- The Fastify API follows a plugin-based architecture
- Validation: Zod schemas directly in route definitions via `fastify-type-provider-zod`
- Dependency Injection: Manual DI via Fastify decorators

### Logging

- The API uses Pino for structured logging with request tracing
- **IMPORTANT**: Never use `console.log` in the API. Use the logger service instead

**Log Methods:**

- `logger.info(message, context?)` - Standard information
- `logger.error(message, error?, context?)` - Errors with automatic Error serialization
- `logger.warn(message, context?)` - Warnings
- `logger.debug(message, context?)` - Debug information
- `logger.http(message, context?)` - HTTP requests
