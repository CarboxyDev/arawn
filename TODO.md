# TODO

### DONE: Email Verification with Resend

### DONE: Reset & Password Functionality

- [x] Add reset password functionality
- [x] Add reset password form component
- [x] Add reset password API route
- [x] Add reset password service
- [x] Add reset password email support

- [x] Add change password functionality
- [x] Add change password form component
- [x] Add change password API route
- [x] Add change password service

### Integration Tests

- [x] Set up test database configuration in Vitest
- [x] Create database setup/teardown utilities for tests
- [x] Add integration test examples for API routes (CRUD flow)
- [x] Add authentication flow integration tests (login → protected route → logout)
- [x] Add transaction and rollback pattern tests
- [x] Document testing patterns in CLAUDE.md concisely

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

### WebSocket Pattern

- [ ] Install and configure `@fastify/websocket`
- [ ] Create WebSocket plugin for Fastify
- [ ] Add simple real-time example (notifications or chat)
- [ ] Create frontend hook for WebSocket subscriptions
- [ ] Add reconnection logic

### Background Jobs & Cron

- [ ] Choose and install job queue library (BullMQ or pg-boss)
- [ ] Create jobs plugin for Fastify
- [ ] Set up worker process configuration
- [ ] Add scheduled jobs (cron) example
- [ ] Integrate email sending as background job
- [ ] Add job monitoring/retry logic

## Improvements to Existing Features

### Validation Utilities

- [ ] Add validation utilities to `packages/utils/src/validation.ts`
  - `isValidEmail()`
  - `isStrongPassword()`
  - `sanitizeInput()`
  - Common regex patterns
- [ ] Make utilities reusable across frontend and backend
- [ ] Add tests for validation utilities

### Improve UI

- Improve UI for pages like login, register, forgot password, reset password, etc.
- Show a better UI for the default dashboard

## Before Release

- [ ] Add VS Code workspace settings (`.vscode/settings.json`)
- [ ] Add badges to README.md (build status, TypeScript, license)
- [ ] Create GitHub social preview image
