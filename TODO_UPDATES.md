# TODO Updates - Must-Add Features

## Core Features

### Email Verification with Resend

- Done

### Integration Tests

- [ ] Set up test database configuration in Vitest
- [ ] Create database setup/teardown utilities for tests
- [ ] Add integration test examples for API routes (CRUD flow)
- [ ] Add authentication flow integration tests (login → protected route → logout)
- [ ] Add transaction and rollback pattern tests
- [ ] Document testing patterns in CLAUDE.md

### Data Table Component

- [ ] Install TanStack Table (if not already present)
- [ ] Create reusable DataTable component with shadcn/ui
- [ ] Implement server-side pagination example
- [ ] Add sorting functionality
- [ ] Add filtering/search functionality
- [ ] Add loading and error states
- [ ] Create example using existing users API
- [ ] Add comprehensive example page in frontend

### File Upload Handling

- [ ] Add multipart form handling in Fastify (`@fastify/multipart`)
- [ ] Create file upload service (S3/R2 compatible with local fallback)
- [ ] Add file validation (size, type, extension)
- [ ] Install and configure `sharp` for image optimization
- [ ] Add upload progress tracking on frontend
- [ ] Create file upload form example component
- [ ] Add `STORAGE_TYPE` env var (local/s3) with validation
- [ ] Add S3/R2 config as optional env vars (don't throw if missing when using local storage)
- [ ] Document file upload patterns in CLAUDE.md

### Rate Limiting Per User

- [ ] Extend existing rate limiting to support user-based limits (not just IP)
- [ ] Add API key rate limiting pattern
- [ ] Implement different rate limits per role (admin vs user)
- [ ] Add rate limit headers to responses (X-RateLimit-Limit, X-RateLimit-Remaining)
- [ ] Document rate limiting strategy in CLAUDE.md

### WebSocket Pattern

- [ ] Install and configure `@fastify/websocket`
- [ ] Create WebSocket plugin for Fastify
- [ ] Add simple real-time example (notifications or chat)
- [ ] Create frontend hook for WebSocket subscriptions
- [ ] Add reconnection logic
- [ ] Document WebSocket patterns in CLAUDE.md

### Background Jobs & Cron

- [ ] Choose and install job queue library (BullMQ or pg-boss)
- [ ] Create jobs plugin for Fastify
- [ ] Set up worker process configuration
- [ ] Add scheduled jobs (cron) example
- [ ] Integrate email sending as background job
- [ ] Add job monitoring/retry logic
- [ ] Document background job patterns in CLAUDE.md

## Improvements to Existing Features

### Better Auth OAuth Documentation

- [ ] Add comment in `apps/api/src/config/env.ts` explaining OAuth env vars are optional
- [ ] Add comment in Better Auth configuration explaining how to enable OAuth
- [ ] Update `.env.local.example` with GitHub/Google OAuth variables (clearly marked as optional)
- [ ] Document OAuth setup process in CLAUDE.md or separate guide

### Test Database Setup

- [ ] Configure Vitest to use separate test database
- [ ] Add test setup file with automatic migrations
- [ ] Document test database workflow

### Environment Variable Validation

- [ ] Add Zod validation for all optional environment variables
- [ ] Ensure validation doesn't throw errors when optional vars are missing
- [ ] Add proper defaults or conditional logic for optional features
- [ ] Examples: `GITHUB_CLIENT_ID`, `GOOGLE_CLIENT_ID`, `S3_BUCKET`, `RESEND_API_KEY`

### Documentation Updates

- [ ] Update DEPLOYMENT.md to be vendor-agnostic (generic requirements first, then platform examples)
- [ ] Create CONTRIBUTING.md with development workflow, code style, and PR guidelines
- [ ] Add LICENSE file (MIT recommended)

## Architecture Improvements

### Error Handling Utilities

- [ ] Create standardized error classes in `packages/utils/src/errors.ts`
  - `ValidationError`
  - `NotFoundError`
  - `UnauthorizedError`
  - `ForbiddenError`
  - `ConflictError`
- [ ] Add automatic HTTP status code mapping in Fastify error handler
- [ ] Update existing code to use standardized errors

### API Response Standardization

- [ ] Create response wrapper utilities in `packages/types`
- [ ] Success response format: `{ data: T, meta?: { page, total, ... } }`
- [ ] Error response format: `{ error: { message, code, details } }` (separate from success)
- [ ] Update all API routes to use standardized response format
- [ ] Document response patterns in CLAUDE.md

### Validation Utilities

- [ ] Add validation utilities to `packages/utils/src/validation.ts`
  - `isValidEmail()`
  - `isStrongPassword()`
  - `sanitizeInput()`
  - Common regex patterns
- [ ] Make utilities reusable across frontend and backend
- [ ] Add tests for validation utilities

## Quick Wins

- [ ] Add GitHub issue templates (bug report, feature request)
- [ ] Add GitHub PR template
- [ ] Add VS Code workspace settings (`.vscode/settings.json`)
- [ ] Add VS Code debug configurations (`.vscode/launch.json`)
- [ ] Add VS Code recommended extensions (`.vscode/extensions.json`)
- [ ] Add badges to README.md (build status, TypeScript, license)
- [ ] Create GitHub social preview image

## Notes

- Email verification must be easily disabled in development (default: disabled)
- Optional environment variables should not cause startup errors when missing
- Focus on practical patterns over extensive boilerplate examples that will be removed.
- All new features should include documentation in CLAUDE.md
