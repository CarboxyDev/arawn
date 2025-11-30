<div align="center">
  <img src="assets/logo.svg" alt="Blitzpack Logo" width="200">
  <h1>Blitzpack</h1>
  <p>Full-stack TypeScript monorepo with Next.js, Fastify, and Turborepo. From zero to production in minutes.</p>

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-≥20.0.0-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-≥9.0.0-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![CI](https://github.com/CarboxyDev/blitzpack/actions/workflows/ci.yml/badge.svg)](https://github.com/CarboxyDev/blitzpack/actions/workflows/ci.yml)

</div>

---

## Why Blitzpack?

Stop wasting days bootstrapping your next project. Most templates hand you a skeleton and leave you to figure out database migrations, API documentation, logging infrastructure, and much more. Blitzpack ships with all of it configured and working. You just need to run a single script to get started with a production-ready full-stack application.

**Ship your next project faster with battle-tested infrastructure already wired up.**

- **Zero-config setup**: Run one command and you're ready to code. Environment files, Docker containers, database migrations—all handled automatically.

- **Full-stack type safety**: Zod schemas define your API contracts once in `packages/types`, then flow automatically to web forms, API validation, and database queries. No duplicate validation logic.

- **Production-grade infrastructure**: Better-auth with session management and OAuth ready. Request ID tracing, automatic validation, rate limiting, structured logging, and environment-aware error responses out of the box.

- **AI pair programming ready**: Comprehensive CLAUDE.md file means AI assistants understand your architecture instantly and can accelerate your development.

## Tech Stack

**Web:** Next.js, React, TanStack Query, Tailwind CSS

**Backend:** Fastify, Prisma, PostgreSQL

**Monorepo:** Turborepo, pnpm workspaces

<details>
<summary>Full stack details</summary>

<p>

**Web**

- Next.js 16 + React 19
- TanStack Query v5 for server state
- shadcn/ui + Tailwind CSS v4
- React Hook Form + Zod validation
- Jotai for client state

**API**

- Fastify 5
- Prisma 7 + PostgreSQL 17
- Better-auth for authentication
- Pino for logging
- Scalar API docs
- Helmet + rate limiting

**Monorepo**

- pnpm workspaces + Turborepo
- Shared packages for types, utils, config in `packages/`
- Vitest for testing
- Husky + lint-staged for pre-commit hooks
</p>
</details>

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

You must have docker installed and running on your machine.

**What's running:**

- Web: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:8080/api](http://localhost:8080/api)
- API Docs: [http://localhost:8080/docs](http://localhost:8080/docs)
- Health Check: [http://localhost:8080/health](http://localhost:8080/health)

**Database tools:**

- Prisma Studio: Run `pnpm db:studio` to open [http://localhost:5555](http://localhost:5555) (recommended for data inspection)

**Built-in pages:**

- `/examples` - Component examples
- `/dashboard` - Protected user dashboard
- `/login` - Sign in page
- `/signup` - Create new account
- `/forgot-password` - Forgot password page
- `/reset-password` - Reset password page

## Project Structure

```
blitzpack/
├── apps/
│   ├── web/          # Next.js app
│   └── api/          # Fastify API
└── packages/
    ├── types/        # Zod schemas + inferred types
    └── utils/        # Shared utilities
```
