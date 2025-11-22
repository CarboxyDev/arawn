## Feature Additions

- [x] User Management Admin UI (full CRUD, search/filter)
- [x] Admin Audit Logging (Postgres-based, track user actions, admin view, no external services)
- [x] Admin Dashboard with all of the admin related pages
- [x] Better Error Pages (custom 404, 500, 403, error boundaries with recovery)

## UI & UX Improvements

- [x] Add "What's Included" section to landing page
- [ ] Improve UI for auth pages (login, register, forgot password, reset password)
- [x] Improve UI for the default dashboard
- [ ] Better loading states (global loading bar, more skeleton screens, optimistic updates, suspense boundaries)
- [ ] Improve mobile responsiveness across all pages

## Pre-Launch Critical

- [ ] Rewrite README with comprehensive features section (auth, security, API, frontend, DX, built-in examples)
- [ ] Add screenshots/GIFs (login, dashboard, API docs, examples page, setup terminal output)
- [ ] Add deployment guide (env vars, platforms, security checklist)
- [ ] Add badges to README.md (build status, TypeScript, license)
- [ ] Create GitHub social preview image

## Documentation Improvements

- [ ] Add comparison table (vs create-t3-app, Turborepo starter, from scratch)
- [ ] Add "Design Philosophy" section (why Fastify, TanStack Query, Zod, monorepo)
- [ ] Add security documentation section (password hashing, CSRF, rate limiting, etc.)
- [ ] Improve Quick Start section with expected output
- [ ] Add troubleshooting section (common setup issues)
- [ ] Add customization guide (rename project, add routes, change schema)

## Bugs to fix

- [] Fix audit log not working for some cases (for example google oauth account creation)
