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

## Feature Additions

- [ ] User Management Admin UI (full CRUD, search/filter)
- [x] Admin Audit Logging (Postgres-based, track user actions, admin view, no external services)
- [x] Admin Dashboard with all of the admin related pages
- [ ] Better Error Pages (custom 404, 500, 403, error boundaries with recovery)
- [ ] SEO Optimization (og:image, Twitter cards, sitemap, robots.txt, JSON-LD)

## Research & Considerations

- [ ] Research multi-tenancy/organizations support (teams, invitations, role-based access per org)
  - Consider: Data isolation strategies (row-level security vs separate schemas)
  - Consider: Invitation flow and team switching UI
  - Consider: Billing per organization vs per user
  - Decide: Build in from start or provide migration guide later?

## Nice to Have

- [ ] Add 2-3 min video walkthrough (setup → signup → API docs → tests)
- [ ] Add performance metrics (build times, bundle sizes, API benchmarks)
- [ ] Add roadmap section
- [ ] Add VS Code workspace settings (`.vscode/settings.json`)

## UI & UX Improvements

- [ ] Improve UI for auth pages (login, register, forgot password, reset password)
- [ ] Show a better UI for the default dashboard
- [ ] Better loading states (global loading bar, more skeleton screens, optimistic updates, suspense boundaries)
- [ ] Better file upload UX (multiple files, progress bars, image cropping, better previews)
- [ ] Form improvements (auto-save drafts, unsaved changes warning, field-level validation feedback)
- [ ] Dark mode polish (smooth transitions, better component coverage)
- [ ] Add breadcrumbs for navigation
- [ ] Improve mobile responsiveness across all pages

## Bugs to fix

- [] Fix audit log not working for some cases (for example google oauth account creation)
