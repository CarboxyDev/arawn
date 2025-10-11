Create a production-ready TypeScript monorepo using pnpm workspaces and Turborepo with this exact structure:

repo/
├─ apps/
│ ├─ frontend/ → Next.js (latest, App Router, Tailwind CSS, TypeScript, ESLint, Prettier)
│ └─ backend/ → NestJS (latest, TypeScript)
├─ shared/
│ ├─ utils/ → shared TypeScript utility functions (built with tsup)
│ ├─ types/ → shared TypeScript types and zod schemas (built with tsup)
│ └─ config/ → shared runtime config + environment helpers (built with tsup)
├─ pnpm-workspace.yaml
├─ turbo.json
├─ tsconfig.base.json
├─ .eslintrc.cjs
├─ .eslintignore
├─ .vscode/settings.json
└─ package.json

**Requirements:**

1. **General setup**

   - Use pnpm (latest) and Turborepo (latest) for monorepo orchestration.
   - All code written in TypeScript.
   - Shared packages imported via aliases like `@repo/shared-utils`, `@repo/shared-types`, and `@repo/shared-config`.
   - Every shared package uses `tsup` as its build tool (`--dts --format cjs,esm --sourcemap`).
   - Add a root `typecheck` script using `tsc --noEmit` that runs before `build` in CI and locally.
   - Root scripts: `dev`, `build`, `typecheck`, `lint`, `lint:fix`.
   - ESLint + Prettier + Husky + lint-staged for clean commits.
   - VS Code integration with `"eslint.workingDirectories": [{ "mode": "auto" }]`.

2. **Frontend (Next.js)**

   - Latest Next.js 15+ (App Router) with Tailwind CSS preconfigured (`tailwind.config.ts`, `postcss.config.js`, `globals.css`).
   - Sample `src/app/page.tsx` and `src/components/Button.tsx`.
   - Imports shared utilities and types (e.g., `@repo/shared-utils`, `@repo/shared-types`).
   - Loads environment variables using **dotenv-flow**.
   - Exports a small example using a shared `UserSchema` from Zod.

3. **Backend (NestJS)**

   - Latest NestJS configured with TypeScript and watch mode.
   - Uses **@nestjs/config** + **dotenv-flow** for environment management.
   - Imports `@repo/shared-types` (Zod schemas) and `@repo/shared-config` for type-safe env usage.
   - Demonstrates parsing and validating env variables via Zod (e.g., API_URL, DATABASE_URL).
   - Scripts: `dev`, `build`, `start`, `lint`.

4. **Shared packages**

   - **shared/types**: contains Zod schemas (e.g., `UserSchema`), exports types via `z.infer`, built with `tsup`.
   - **shared/utils**: small general-purpose helpers, built with `tsup`.
   - **shared/config**: central environment loader using `dotenv-flow` and Zod to parse/validate env vars, built with `tsup`.
   - Each has its own `tsconfig.json` and build scripts (`dev`, `build`).

5. **Environment setup**

   - Use **dotenv-flow** for `.env`, `.env.local`, `.env.dev`, `.env.prod` layering.
   - Each app (`frontend`, `backend`) and `shared/config` should include a `.env.local` example.
   - `shared/config` should expose a `loadEnv()` function that validates env vars using Zod and returns a typed object.

6. **Type-safe API contracts**

   - Zod schemas live in `shared/types`.
   - Backend reuses these schemas for request validation.
   - Frontend imports them for type-safe fetches or mock data.

7. **CI setup**

   - Include a simple GitHub Actions workflow that runs:
     - `pnpm install --frozen-lockfile`
     - `pnpm run typecheck`
     - `pnpm run build`
     - `pnpm run lint`

8. **Output**
   - Full folder + file structure.
   - All commands to initialize and install dependencies.
   - All relevant config and JSON/CJS/TS files exactly as they should appear.
   - Include sample code for:
     - A `UserSchema` in `shared/types`
     - A `loadEnv()` helper in `shared/config`
     - Example usage in both frontend (`page.tsx`) and backend (`main.ts` or a service)
   - Keep output concise, without long explanations — just commands + file contents.
