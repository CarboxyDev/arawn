<div align="center">
  <img src="assets/logo.svg" alt="Blitzpack Logo" width="200">
  <h1>Blitzpack</h1>
  <p>Full-stack TypeScript monorepo template with Next.js, Fastify, and Turborepo. From zero to production in minutes.</p>

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

- **Zero-config setup**: Run a few commands and you're ready to code. Environment files, Docker containers, database migrations—all handled automatically.

- **Full-stack type safety**: Zod schemas define your API contracts once in `packages/types`, then flow automatically to web forms, API validation, and database queries. No duplicate validation logic.

- **Production-grade infrastructure**: Better-auth with session management and OAuth ready. Request ID tracing, automatic validation, rate limiting, structured logging, and environment-aware error responses out of the box.

- **AI pair programming ready**: Comprehensive CLAUDE.md file acts as the perfect starting point for AI assistants to understand your architecture instantly and can accelerate your development.

## Quick Start

You must have Docker installed and running on your machine.

```bash
# Create a new project
pnpm create blitzpack

# Start PostgreSQL and run migrations
docker compose up -d
pnpm db:migrate

# Start development
pnpm dev
```

Optional: Run `pnpm db:seed` to add test data (admin accounts, sample users).

**What's running:**

- Web: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:8080/api](http://localhost:8080/api)
- API Docs: [http://localhost:8080/docs](http://localhost:8080/docs)

## Tech Stack

**Web**

- Next.js 16
- React 19
- Tailwind CSS v4 for styling
- shadcn/ui for UI primitives
- TanStack Query for server state
- React Hook Form for forms
- Recharts for data visualization

**API**

- Fastify 5
- Prisma 7 and PostgreSQL 17
- Better-auth for authentication
- Pino for structured logging
- Scalar for API docs
- React Email and Resend for emails
- AWS S3 for file storage

**Monorepo**

- Turborepo
- pnpm workspaces
- Vitest for testing
- Husky and lint-staged for git hooks
- Shared packages for types, utils, config in `packages/`

## Project Structure

```
blitzpack/
├── apps/
│   ├── web/                   # Next.js frontend (port 3000)
│   │   ├── src/
│   │   │   ├── app/           # Pages and layouts
│   │   │   ├── components/    # React components
│   │   │   ├── lib/           # API client, utilities
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   └── store/         # Jotai state atoms
│   │   └── public/            # Static assets
│   │
│   └── api/                   # Fastify backend (port 8080)
│       ├── src/
│       │   ├── routes/        # API endpoints
│       │   ├── services/      # Business logic
│       │   ├── plugins/       # Fastify plugins
│       │   ├── hooks/         # Request hooks (auth, validation)
│       │   └── config/        # Configuration files
│       ├── prisma/            # Database schema & migrations
│       └── emails/            # React Email templates
│
├── packages/
│   ├── types/                 # Shared types and Zod schemas
│   ├── utils/                 # Shared utilities
│   ├── ui/                    # Shared UI components
│   └── tailwind-config/       # Shared Tailwind configuration
│
├── docker-compose.yml         # Development services (PostgreSQL)
├── docker-compose.prod.yml    # Production deployment
├── Dockerfile                 # Multi-stage production build
├── turbo.json                 # Turborepo configuration
└── pnpm-workspace.yaml        # pnpm workspaces configuration
```

## Features

### Authentication & Authorization

Production-ready auth system powered by Better Auth:

- **Email/Password Auth**: User signup with email verification, secure password hashing, password reset flow, and password change functionality.
- **OAuth Integration**: Google and GitHub OAuth providers ready to enable with environment variables.
- **Role-Based Access Control**: Three user roles (user, admin, super_admin) with role-based route protection and API authorization.
- **Session Management**: 7-day sessions with automatic refresh, secure cookie-based authentication, and cross-domain support.
- **User Banning**: Ban users temporarily or permanently with custom reasons and automatic expiration handling.
- **Email Verification**: Send verification emails on signup with resend capability and verification status tracking.

**Included pages:** `/login`, `/signup`, `/forgot-password`, `/reset-password`

### Admin Dashboard

Complete admin control panel with real-time monitoring and management:

- **System Monitoring**: Real-time metrics dashboard with user growth trends, session activity, role distribution, and system health indicators. Auto-refresh functionality with configurable intervals.
- **User Management**: Full CRUD operations on users with pagination, sorting, and filtering. Create, edit, ban/unban users with expiration dates, and manage user roles.
- **Session Management**: View all active sessions across the platform, inspect session details (IP, device, timestamps), and revoke individual or all user sessions.

**Included pages:** `/admin`, `/admin/users`, `/admin/sessions`

### API Infrastructure

Battle-tested API architecture:

- **Comprehensive Routes**: RESTful API endpoints for users, sessions, uploads, stats, metrics, and admin operations.
- **Validation**: Automatic request/response validation with Zod schemas and type-safe route definitions.
- **Security**: Helmet security headers, CORS configuration, role-based rate limiting, and cookie signing.
- **Logging**: Structured logging with Pino featuring 4 verbosity levels, request ID tracing, and performance metrics.
- **Documentation**: Auto-generated OpenAPI specs with interactive Scalar API documentation.
- **Scheduled Tasks**: Automatic session cleanup and maintenance tasks.

### Developer Experience

Optimized workflows and tooling:

- **CLI Tool**: `create-blitzpack` interactive setup wizard for instant project scaffolding.
- **Comprehensive Scripts**: Development, build, test, lint, and database management commands.
- **Testing Suite**: Vitest-powered unit and integration tests with coverage reporting.
- **Git Hooks**: Pre-commit linting and formatting, pre-push type checking and testing.
- **Turborepo**: Smart caching, parallel execution, and dependency tracking.
- **Production Docker**: Multi-stage builds, health checks, and optimized runtime containers.

### Email System

Transactional email infrastructure with beautiful templates:

- **React Email Templates**: Pre-built email templates for verification, password reset, password change, welcome, and account deletion.
- **Resend Integration**: Production-ready email sending with Resend API.
- **Development Preview**: Console logging of emails in development with React Email dev server.
