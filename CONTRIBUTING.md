# Contributing to Blitzpack

Thank you for your interest in contributing! This is a TypeScript monorepo template designed to help developers ship full-stack applications super fast.

---

## Setup

1. Fork and clone the repository
2. Run `pnpm install && pnpm init:project`
3. Start development: `pnpm dev`

## Development

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes following the code style in `CLAUDE.md`
3. Run checks: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`
4. Commit like a sane person
5. Push and create a Pull request

## Code Style

- Follow patterns in `CLAUDE.md`
- Always use import aliases (`@/...`)

## Pull Requests

- Rebase on latest main before submitting
- Ensure all CI checks pass
- Update documentation if needed

For detailed architecture and patterns, see `CLAUDE.md`.
