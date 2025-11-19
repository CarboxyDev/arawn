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

- [ ] Install TanStack Table
- [ ] Create reusable DataTable component with shadcn/ui
- [ ] Implement server-side pagination example
- [ ] Add sorting functionality
- [ ] Add filtering/search functionality
- [ ] Add loading and error states
- [ ] Create example using existing users API
- [ ] Add comprehensive example page in frontend

### DONE: File Upload Handling

- [x] Add multipart form handling in Fastify (`@fastify/multipart`)
- [x] Create file upload service (S3/R2 compatible with local fallback)
- [x] Add file validation (size, type, extension)
- [x] Install and configure `sharp` for image optimization
- [x] Add upload progress tracking on frontend
- [x] Create file upload form example component
- [x] Add `STORAGE_TYPE` env var (local/s3) with validation
- [x] Add S3/R2 config as optional env vars (don't throw if missing when using local storage)
- [x] Document in CLAUDE.md

### Rate Limiting Per User

- [ ] Extend existing rate limiting to support user-based limits (not just IP)
- [ ] Add API key rate limiting pattern
- [ ] Implement different rate limits per role (admin vs user)
- [ ] Add rate limit headers to responses (X-RateLimit-Limit, X-RateLimit-Remaining)

### Google OAuth Updates

- [ ] Add Google OAuth button and functionality to the login page
- [ ] Add Google OAuth button and functionality to the sign-up page

## Improvements to Existing Features

### Improve UI

- Improve UI for pages like login, register, forgot password, reset password, etc.
- Show a better UI for the default dashboard

## Before Release

- [ ] Add VS Code workspace settings (`.vscode/settings.json`)
- [ ] Add badges to README.md (build status, TypeScript, license)
- [ ] Create GitHub social preview image
