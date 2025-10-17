# Template Setup

After clicking "Use this template" and cloning your repository:

## Quick Start (Use As-Is)

```bash
pnpm install
pnpm init:project
pnpm dev
```

**That's it!** The template works out of the box. Customize when ready.

## When You're Ready to Customize

### Update Branding

- `apps/frontend/src/config/site.ts` → Project name, description, GitHub URL
- `README.md` → Replace Arawn README.md with yours

### Optional: Change Database Credentials

Default credentials: `postgres/postgres_dev_password/app_dev`

To use different credentials:

1. Update `docker-compose.yml` (POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB)
2. Update `apps/backend/.env.local` (DATABASE_URL must match step 1)
3. Restart Docker: `docker compose down && docker compose up -d`
4. Run migrations: `pnpm --filter @repo/backend db:migrate`

---

**Delete this file when done.**
