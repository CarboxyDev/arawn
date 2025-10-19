<div align="center">
  <img src="assets/logo.svg" alt="Arawn Logo" width="200">
  <h1>Arawn</h1>
  <p>Production-ready TypeScript monorepo with Next.js 15, NestJS 11, Turborepo and other modern technologies. Everything you need to ship fast.</p>
</div>

---

## Why Arawn?

Stop wasting days bootstrapping your next project. Most templates hand you a skeleton and leave you to figure out database migrations, API documentation, logging infrastructure, and much more. Arawn ships with all of it configured and working. You just need to run a single script to get started with a production-ready full-stack application.

**This is not your average starter template. It's a production foundation.**

- **Full-stack type safety**: Zod schemas define your API contracts. Types flow from database to UI automatically without any hassle.
- **Zero-config setup**: One command creates env files, spins up docker, runs migrations, and gets you ready to ship in a fraction of the time.
- **Production-grade authentication**: Better-auth integration with email/password, session management, and OAuth ready (GitHub, Google). Protected routes and auth guards out of the box.
- **Production-grade infrastructure**: Global exception filter with request ID tracing, automatic Zod validation on all endpoints, rate limiting, environment-aware error responses
- **Shared validation logic**: Write your schemas once in `shared/types`, use them everywhere (frontend forms, API validation, DB queries)
- **Real testing infrastructure**: Vitest configured for frontend, backend, and shared packages with coverage reports
- **Auto-generated API docs**: Swagger + Scalar documentation generated directly from your Zod schemas
- **AI pair programming ready**: This template ships with a comprehensive CLAUDE.md file that means AI assistants understand your architecture instantly and can help accelerate your development process.

**Arawn is built for teams shipping real products, not toy demos.**

## Tech Stack

**Frontend**

- Next.js 15 + React 19
- TanStack Query v5 for server state
- shadcn/ui + Tailwind CSS v4
- React Hook Form + Zod validation
- Jotai for client state

**Backend**

- NestJS 11
- Prisma 6 + PostgreSQL 17
- Better-auth for authentication
- Pino for logging infrastructure
- Swagger + Scalar API docs
- Helmet + rate limiting

**Monorepo**

- pnpm workspaces + Turborepo
- Shared packages for types, utils, config
- Vitest for testing
- Husky + lint-staged for pre-commit hooks

## Quick Start

```bash
# Install dependencies
pnpm install

# Automated setup (creates .env files, starts docker, runs migrations)
pnpm init:project

# Start development
pnpm dev
```

The setup script handles everything: environment files, docker containers, database migrations, and optional seeding. Safe to run multiple times.

**What's running:**

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:8080](http://localhost:8080)
- API Docs: [http://localhost:8080/docs](http://localhost:8080/docs)

**Database tools:**

- Prisma Studio: Run `pnpm db:studio` to open [http://localhost:5555](http://localhost:5555) (recommended for data inspection)
- pgAdmin (optional): Run `docker-compose --profile tools up -d` for [http://localhost:5050](http://localhost:5050) (admin@example.com / admin123)

**Built-in pages:**

- `/login` - Sign in page
- `/signup` - Create new account
- `/dashboard` - Protected user dashboard
- `/examples` - Component examples

**Requirements:** Node.js ≥20, pnpm ≥9, docker

## Project Structure

```
arawn/
├── apps/
│   ├── frontend/     # Next.js 15 app
│   └── backend/      # NestJS API
└── shared/
    ├── types/        # Zod schemas + inferred types
    ├── utils/        # Shared utilities
    └── config/       # Environment config
```

## Essential Commands

**Development**

```bash
pnpm dev              # Start all apps
pnpm build            # Build everything
pnpm typecheck        # Type check
pnpm test             # Run tests
```

**Database** (from `apps/backend`)

```bash
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Prisma Studio
pnpm db:seed          # Seed database
pnpm db:reset         # Fresh database
```

## Key Features

**Type Safety Everywhere**

- Zod schemas in `shared/types` serve as single source of truth
- Types inferred from schemas (`z.infer<typeof Schema>`)
- Runtime validation on API requests and environment variables
- TypeScript strict mode across all packages

**Smart Build Pipeline**

- Turborepo orchestrates dependencies automatically
- Shared packages rebuild before apps consume them
- Intelligent caching speeds up subsequent builds
- Parallel execution where possible

**Authentication & Security**

- Better-auth with email/password authentication
- Session-based auth with 7-day expiration
- Protected routes with auth guards
- OAuth ready for GitHub and Google
- Helmet for secure HTTP headers
- Rate limiting (default 30 req/min per IP)
- CORS configured for frontend origin only
- Structured logging with Pino (request IDs, configurable verbosity)
- Environment validation on startup

**Developer Experience**

- One command setup with `pnpm init:project`
- Pre-commit hooks format and lint automatically
- Vitest for fast, modern testing
- API docs auto-generated from Zod schemas
- CLAUDE.md for AI pair programming context

---

## Design Principles

This template makes specific choices to optimize for production use:

1. **Workspace dependencies over npm packages** - Real monorepo benefits, not just code co-location
2. **Zod as validation layer** - One schema definition for runtime + compile-time safety
3. **Opinionated tooling** - Prettier, ESLint, Husky pre-configured so you can focus on features
4. **Documentation for AI** - Structured context files help AI assistants understand your codebase
