# create-blitzpack

CLI tool to scaffold a new Blitzpack project - full-stack TypeScript monorepo with Next.js and Fastify.

## Usage

```bash
pnpm create blitzpack
```

## Options

```bash
pnpm create blitzpack [project-name] [options]
```

- `[project-name]` - Name of the project (prompted if not provided)
- `--skip-git` - Skip git initialization
- `--skip-install` - Skip dependency installation
- `--dry-run` - Preview changes without creating files

## What You Get

- **Web**: Next.js 16 + React 19 + Tailwind CSS v4 + shadcn/ui
- **API**: Fastify 5 + Prisma 7 + PostgreSQL + Better Auth
- **Monorepo**: Turborepo + pnpm workspaces
- **Production-ready**: Auth, admin dashboard, logging, validation, testing, Docker

## Requirements

- Node.js ≥20.0.0
- pnpm ≥9.0.0
- Docker (for PostgreSQL)

## Next Steps

After scaffolding:

```bash
cd your-project
docker compose up -d       # Start PostgreSQL
pnpm db:migrate           # Run migrations
pnpm dev                  # Start development
```

## Documentation

Full documentation: [github.com/CarboxyDev/blitzpack](https://github.com/CarboxyDev/blitzpack)

## License

MIT
