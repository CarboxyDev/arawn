<div align="center">
  <img src="assets/logo.svg" alt="Arawn Logo" width="200">
  <h1>Arawn</h1>
  <p>An opinionated, production-ready TypeScript monorepo template using pnpm workspaces and Turborepo. Batteries included, ready to scale.</p>
</div>

## Features

### Core Stack

- 🚀 **Next.js 15** with App Router for the frontend
- 🎯 **NestJS** for the backend API
- 📦 **Shared packages** for types, utilities, and configuration
- 🔒 **Type-safe environment variables** with Zod validation
- 🏗️ **Turborepo** for optimized build orchestration
- 🧰 **Modern tooling**: TypeScript, ESLint, Prettier, Husky
- 📝 **Runtime validation** with Zod schemas as single source of truth
- 🤖 **AI-ready**: Comprehensive CLAUDE.md for instant AI assistant onboarding

### Frontend Batteries 🔋

- 🎨 **shadcn/ui** - Beautiful, accessible component system with Radix UI
- 🎭 **Tailwind CSS v4** - Latest Tailwind with CSS-first configuration
- 🌓 **Dark mode** - Built-in theme support with next-themes
- 🔄 **TanStack Query v5** - Powerful data fetching and caching
- 🧪 **Jotai** - Primitive and flexible state management
- 📋 **React Hook Form** - Performant forms with Zod validation
- 🔔 **Sonner** - Beautiful toast notifications
- 🎨 **Framer Motion** - Animation library for smooth transitions
- 🎯 **TypeScript** - Full type safety across the stack

### Backend Batteries 🔋

- 📚 **Swagger + Scalar** - Auto-generated API documentation at `/docs`
- 🗄️ **Prisma 6** - Type-safe ORM with PostgreSQL
- 🐘 **PostgreSQL 17** - Local development via Docker Compose
- 🔒 **Security** - Helmet for secure HTTP headers, rate limiting with @nestjs/throttler
- 🌐 **CORS** - Configured for secure cross-origin requests
- 🛡️ **NestJS** - Production-ready architecture with dependency injection
- ✅ **Zod v4** - Runtime validation for requests and responses

## Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Docker (for local PostgreSQL)

## Getting Started

```bash
# 1. Install dependencies
pnpm install

# 2. Start PostgreSQL with Docker
docker-compose up -d

# 3. Set up environment variables
cp apps/frontend/.env.local.example apps/frontend/.env.local
cp apps/backend/.env.local.example apps/backend/.env.local
cp apps/backend/.env.local.example apps/backend/.env  # For Prisma
# Edit .env files with your configuration

# 4. Run database migrations
cd apps/backend && pnpm db:migrate
cd ../..

# 5. Start development (builds shared packages and runs all apps)
pnpm dev
```

**Services:**

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`
- API Docs: `http://localhost:8080/docs`
- PostgreSQL: `localhost:5432`
- pgAdmin: `http://localhost:5050` (admin@arawn.dev / admin)

Pre-commit hooks (Husky + lint-staged) automatically format and lint staged files.

## Monorepo Structure

```
arawn/
├── apps/
│   ├── frontend/          # Next.js 15 application (port 3000)
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
# Frontend (runs on port 3000)
cd apps/frontend
pnpm dev              # Next.js dev server
pnpm build            # Production build
pnpm typecheck        # Type checking only

# Backend (runs on port 8080)
cd apps/backend
pnpm dev              # NestJS watch mode
pnpm build            # Production build
pnpm start            # Run production build

# Database (Prisma)
cd apps/backend
pnpm db:generate      # Generate Prisma Client
pnpm db:migrate       # Create and apply migrations
pnpm db:push          # Push schema changes (no migration)
pnpm db:studio        # Open Prisma Studio GUI
pnpm db:seed          # Seed database

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

Environment variables are validated on startup with Zod:

- **Backend**: Uses `@repo/shared-config` with `dotenv-flow` (see `.env.local.example`)
- **Frontend**: Next.js environment variables (only `NEXT_PUBLIC_*` exposed to client)

### Security

Backend security features:

- **Helmet**: Secure HTTP headers (CSP, HSTS, X-Frame-Options, etc.)
- **Rate Limiting**: 10 requests per 60 seconds per IP via @nestjs/throttler
- **CORS**: Strict origin policy (only `FRONTEND_URL` allowed)
- **Credentials**: Cookie-based authentication support

### Code Quality

Pre-commit hooks (Husky + lint-staged) enforce:

- Prettier formatting
- ESLint rules
- Only on staged files (fast commits)

### AI-Assisted Development

The codebase includes structured documentation for AI assistants:

- **CLAUDE.md**: Comprehensive context file with architecture, commands, and coding standards
- **Import aliases enforced**: Clear patterns for AI to follow (@/\* for local imports)
- **Well-documented structure**: Helps AI understand the codebase instantly
- **Consistent conventions**: Makes autonomous refactoring and feature additions safer

## Philosophy

This template is opinionated by design:

- **Type safety first**: Runtime validation + compile-time checking
- **Monorepo done right**: Workspace dependencies, not published packages
- **Fast feedback**: Turborepo caching and parallel execution makes it blazingly fast
- **Production-ready**: Environment validation, proper build pipeline, code quality guardrails
- **Brilliant DX**: HMR, instant updates across packages, clear error messages
