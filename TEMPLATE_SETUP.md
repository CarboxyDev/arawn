# Template Setup Guide

This repository is a production-ready TypeScript monorepo template. Use this guide to set up a new project based on this template.

## Quick Setup (Automated)

Use the automated setup script to create a new project:

```bash
# Clone the repository
git clone <this-repo-url> my-new-project
cd my-new-project

# Run the setup script
chmod +x setup.sh
./setup.sh

# Start development
pnpm dev
```

The setup script will:

- Prompt for your new project name
- Rename all package names and scopes
- Update branding in the frontend
- Reinitialize git repository
- Install dependencies
- Create .env.local files from examples

## Manual Setup

If you prefer to set things up manually, follow these steps:

### 1. Clone and Initialize

```bash
git clone <this-repo-url> my-new-project
cd my-new-project
rm -rf .git
git init
```

### 2. Update Package Names

Update the `name` field in these files (replace `@repo` with your scope, e.g., `@mycompany`):

- `package.json` - Root workspace
- `apps/frontend/package.json` - Frontend app
- `apps/backend/package.json` - Backend app
- `shared/types/package.json` - Shared types package
- `shared/utils/package.json` - Shared utils package
- `shared/config/package.json` - Shared config package

Example:

```json
{
  "name": "@mycompany/my-project",
  "version": "1.0.0"
}
```

### 3. Update Repository Metadata

In the root `package.json`, update:

```json
{
  "name": "@mycompany/my-project",
  "description": "Your project description",
  "author": "Your Name",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourname/my-project"
  }
}
```

### 4. Update Frontend Branding

Edit `apps/frontend/src/app/page.tsx`:

```tsx
<h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
  Your Project Name
</h1>
<p className="text-gray-600 text-lg">
  Your project description
</p>
```

Update `apps/frontend/src/app/layout.tsx` metadata:

```tsx
export const metadata: Metadata = {
  title: 'Your Project Name',
  description: 'Your project description',
};
```

### 5. Configure Environment Variables

Copy the example environment files and configure them:

```bash
# Frontend
cp apps/frontend/.env.local.example apps/frontend/.env.local

# Backend
cp apps/backend/.env.local.example apps/backend/.env.local
```

Edit the `.env.local` files with your configuration:

**Frontend (.env.local):**

```env
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:8080
```

**Backend (.env.local):**

```env
NODE_ENV=development
PORT=8080
API_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
```

### 6. Install Dependencies

```bash
pnpm install
```

### 7. Start Development

```bash
pnpm dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3000 (or your configured PORT)

## Using as a GitHub Template

### Option 1: Create Template Repository

1. Push this repository to GitHub
2. Go to Settings → Check "Template repository"
3. For new projects, click "Use this template" on GitHub

### Option 2: Clone Directly

```bash
git clone --depth 1 <this-repo-url> my-new-project
cd my-new-project
rm -rf .git
git init
```

## What's Included

This template includes:

### Shared Packages

- **@repo/shared-types** - Zod schemas and TypeScript types
  - Health check schemas
  - User schemas
  - API response types
- **@repo/shared-utils** - Common utility functions
  - String utilities (slugify, truncate)
  - Date utilities (formatDate, formatDateTime, getRelativeTime)
  - Async utilities (delay, retry)
  - Number utilities (formatBytes, clamp)
  - Array utilities (unique, groupBy)
- **@repo/shared-config** - Environment configuration with Zod validation

### Applications

- **Frontend** - Next.js 15 with App Router, React 19, Tailwind CSS
- **Backend** - NestJS with health check endpoint, user CRUD examples

### Development Tools

- **Turborepo** - Optimized task orchestration
- **pnpm** - Fast, disk-efficient package manager
- **ESLint + Prettier** - Code quality and formatting
- **Husky** - Pre-commit hooks via lint-staged

## Project Structure

```
arawn/
├── apps/
│   ├── frontend/          # Next.js application (port 3000)
│   └── backend/           # NestJS application (configurable PORT)
├── shared/
│   ├── types/             # Shared Zod schemas and types
│   ├── utils/             # Shared utility functions
│   └── config/            # Environment configuration
├── package.json           # Root workspace configuration
├── turbo.json            # Turborepo configuration
├── pnpm-workspace.yaml   # pnpm workspace configuration
└── setup.sh              # Automated setup script
```

## Common Commands

```bash
# Development
pnpm dev              # Start all apps in dev mode
pnpm build            # Build all packages and apps
pnpm typecheck        # Type check all packages
pnpm lint             # Lint all packages
pnpm lint:fix         # Lint and auto-fix all packages

# Individual apps
cd apps/frontend && pnpm dev    # Frontend only
cd apps/backend && pnpm dev     # Backend only
```

## Next Steps After Setup

1. **Update the health check version** in `apps/backend/src/app.service.ts`
2. **Configure your database** and update DATABASE_URL in backend .env.local
3. **Customize shared types** in `shared/types/src/index.ts` for your domain
4. **Add your business logic** to the backend controllers/services
5. **Build your UI** in the frontend app
6. **Remove example User CRUD** if not needed (controller, service, types)

## Troubleshooting

### Build fails for shared packages

```bash
# Rebuild shared packages
pnpm --filter "@repo/shared-*" build
```

### Module not found errors in dev mode

```bash
# Clean and reinstall
rm -rf node_modules apps/*/node_modules shared/*/node_modules
pnpm install
pnpm build
```

### Port already in use

```bash
# Frontend (change in next.config.ts or use -p flag)
cd apps/frontend && pnpm dev -- -p 3002

# Backend (change PORT in .env.local)
PORT=3001 pnpm dev
```

## Additional Resources

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [Zod Documentation](https://zod.dev)
