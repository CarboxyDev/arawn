# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Production-ready TypeScript monorepo using pnpm workspaces and Turborepo, featuring a Next.js frontend and NestJS backend with shared packages for types, utilities, and configuration.

## Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0

## Common Commands

### Development

```bash
pnpm dev              # Start all applications in dev mode (frontend on :3001, backend on configured PORT)
pnpm build            # Build all packages and applications
pnpm typecheck        # Type check all packages
pnpm lint             # Lint all packages
pnpm lint:fix         # Lint and auto-fix all packages
```

### Individual Package Commands

```bash
# Frontend (Next.js on port 3001)
cd apps/frontend
pnpm dev              # Start Next.js dev server
pnpm build            # Build production bundle
pnpm typecheck        # Type check only

# Backend (NestJS)
cd apps/backend
pnpm dev              # Start NestJS with watch mode
pnpm build            # Build production bundle
pnpm start            # Run production build

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

### Environment Configuration

Environment variables are managed via `dotenv-flow` and validated with Zod:

- Configuration defined in `shared/config/src/index.ts`
- Required variables: `NODE_ENV`, `API_URL`, `DATABASE_URL`, `PORT`
- Each app has `.env.local.example` files showing expected variables
- Backend uses `loadEnv()` from `@repo/shared-config` on startup

### Type Safety

The codebase emphasizes runtime and compile-time type safety:

- Zod schemas in `shared/types` serve as single source of truth
- Types are inferred from schemas using `z.infer<typeof Schema>`
- Environment variables are validated at runtime
- All packages use strict TypeScript settings from `tsconfig.base.json`

## Development Workflow

1. Install dependencies: `pnpm install`
2. Build shared packages first (or run `pnpm dev` to build automatically)
3. Set up environment variables by copying `.env.local.example` files to `.env.local`
4. Start development: `pnpm dev` (runs all apps concurrently)

Pre-commit hooks (via Husky and lint-staged) automatically format and lint changed files.
