# Arawn

An opinionated, production-ready TypeScript monorepo template using pnpm workspaces and Turborepo. Batteries included, ready to scale.

## Features

- 🚀 **Next.js 15** with App Router for the frontend
- 🎯 **NestJS** for the backend API
- 📦 **Shared packages** for types, utilities, and configuration
- 🔒 **Type-safe environment variables** with Zod validation
- 🏗️ **Turborepo** for optimized build orchestration
- 🧰 **Modern tooling**: TypeScript, ESLint, Prettier, Husky
- 📝 **Runtime validation** with Zod schemas as single source of truth

## Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0

## Quick Start

```bash
# Install dependencies
pnpm install

# Copy environment examples
cp apps/frontend/.env.local.example apps/frontend/.env.local
cp apps/backend/.env.local.example apps/backend/.env.local

# Start development (builds shared packages and runs all apps)
pnpm dev
```

Frontend runs on `http://localhost:3001`, backend on configured PORT.

## Monorepo Structure

```
arawn/
├── apps/
│   ├── frontend/          # Next.js 15 application (port 3001)
│   └── backend/           # NestJS application
├── shared/
│   ├── types/            # Zod schemas and TypeScript types
│   ├── utils/            # Shared utility functions
│   └── config/           # Environment configuration
├── turbo.json            # Turborepo task configuration
└── pnpm-workspace.yaml   # Workspace definition
```

## Commands

### Root-level commands

```bash
pnpm dev              # Start all apps in development mode
pnpm build            # Build all packages and applications
pnpm typecheck        # Type check all packages
pnpm lint             # Lint all packages
pnpm lint:fix         # Lint and auto-fix issues
```

### Per-package commands

```bash
# Frontend
cd apps/frontend
pnpm dev              # Next.js dev server
pnpm build            # Production build
pnpm typecheck        # Type checking only

# Backend
cd apps/backend
pnpm dev              # NestJS watch mode
pnpm build            # Production build
pnpm start            # Run production build

# Shared packages
cd shared/{types|utils|config}
pnpm dev              # Watch mode with tsup
pnpm build            # Build with tsup
```

## Architecture Decisions

### Workspace Dependencies

All shared packages are consumed as workspace dependencies (`workspace:*`), providing:

- True monorepo development experience
- Instant updates when shared code changes
- Type safety across package boundaries
- Both CJS and ESM output formats

### Build Pipeline

Turborepo manages build dependencies automatically:

- Shared packages must build before apps can import them
- All builds depend on type checking
- Dev mode depends on shared package builds
- Parallel execution where possible

### Type Safety

The template enforces type safety at multiple levels:

- **Runtime**: Zod schemas validate data at runtime
- **Compile-time**: TypeScript strict mode across all packages
- **Environment**: Configuration validated on startup
- **Single source of truth**: Types inferred from Zod schemas via `z.infer<>`

### Environment Configuration

Environment variables are managed centrally:

- `dotenv-flow` handles `.env`, `.env.local`, and environment-specific files
- Zod schemas in `@repo/shared-config` validate configuration
- Apps fail fast with clear errors for missing/invalid variables
- Type-safe access to environment variables throughout the codebase

### Code Quality

Pre-commit hooks (Husky + lint-staged) enforce:

- Prettier formatting
- ESLint rules
- Only on staged files (fast commits)

## Shared Packages

### `@repo/shared-types`

Zod schemas and TypeScript types shared across apps:

```typescript
import { UserSchema, type User } from '@repo/shared-types';

const user: User = UserSchema.parse(data);
```

### `@repo/shared-utils`

Common utility functions:

```typescript
import { formatDate, debounce } from '@repo/shared-utils';
```

### `@repo/shared-config`

Environment configuration with validation:

```typescript
import { loadEnv, config } from '@repo/shared-config';

loadEnv(); // Call once at app startup
console.log(config.API_URL); // Type-safe access
```

## Development Workflow

1. **Install**: `pnpm install`
2. **Environment**: Copy and configure `.env.local.example` files
3. **Build shared packages**: `pnpm build --filter="./shared/*"` (or let `pnpm dev` handle it)
4. **Develop**: `pnpm dev`
5. **Commit**: Pre-commit hooks automatically format and lint

## Philosophy

This template is opinionated by design:

- **Type safety first**: Runtime validation + compile-time checking
- **Monorepo done right**: Workspace dependencies, not published packages
- **Fast feedback**: Turborepo caching and parallel execution
- **Production-ready**: Environment validation, proper build pipeline, code quality gates
- **Developer experience**: Hot reload, instant updates across packages, clear error messages

## License

MIT
