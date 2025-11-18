# Contributing to Arawn

Thank you for your interest in contributing to Arawn! This document provides guidelines and instructions for contributing to this TypeScript monorepo template.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style & Standards](#code-style--standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

---

## Code of Conduct

This project adheres to a code of conduct that all contributors are expected to follow:

- **Be respectful**: Treat everyone with respect and kindness
- **Be collaborative**: Work together and help each other
- **Be constructive**: Provide helpful feedback and accept criticism gracefully
- **Be inclusive**: Welcome contributors of all backgrounds and skill levels

---

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js**: Version 20.0.0 or higher
- **pnpm**: Version 9.0.0 or higher
- **Docker**: For running PostgreSQL locally
- **Git**: For version control

### Initial Setup

1. **Fork the repository** on GitHub

2. **Clone your fork**:

   ```bash
   git clone https://github.com/YOUR_USERNAME/arawn.git
   cd arawn
   ```

3. **Add upstream remote**:

   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/arawn.git
   ```

4. **Run automated setup**:

   ```bash
   pnpm install
   pnpm init:project
   ```

   This will:
   - Install all dependencies
   - Create `.env.local` files
   - Start Docker PostgreSQL
   - Run database migrations
   - Optionally seed test data

5. **Start development servers**:

   ```bash
   pnpm dev
   ```

   - Frontend: http://localhost:3000
   - API: http://localhost:8080
   - API Docs: http://localhost:8080/docs

---

## Development Workflow

### Branch Strategy

- `main`: Production-ready code
- `feature/*`: New features (`feature/add-email-verification`)
- `fix/*`: Bug fixes (`fix/cors-issue`)
- `docs/*`: Documentation updates (`docs/update-readme`)
- `refactor/*`: Code refactoring (`refactor/user-service`)

### Creating a Feature

1. **Create a feature branch**:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**:
   - Write code following our [style guidelines](#code-style--standards)
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**:

   ```bash
   pnpm typecheck   # Check TypeScript types
   pnpm lint        # Check code style
   pnpm test        # Run all tests
   pnpm build       # Ensure builds succeed
   ```

4. **Commit your changes**:

   ```bash
   git add .
   git commit -m "feat: add email verification feature"
   ```

5. **Keep your branch updated**:

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

6. **Push to your fork**:

   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request** on GitHub

---

## Code Style & Standards

### TypeScript

- **Strict mode enabled**: All packages use TypeScript strict mode
- **Type definitions**: Prefer `interface` for objects, `type` for unions/intersections
- **Explicit types**: Use explicit return types for functions
- **No `any`**: Avoid using `any` type (use `unknown` if necessary)

### Naming Conventions

- **Files/Folders**: Use kebab-case (`user-profile/`, `api-client.ts`)
- **Components**: Use PascalCase (`UserProfile.tsx`, `QuizForm.tsx`)
- **Functions/Variables**: Use camelCase (`getUserData`, `isLoading`)
- **Custom Hooks**: Prefix with `use` (`useUserData`, `useAuth`)
- **Constants**: Use UPPER_SNAKE_CASE (`API_URL`, `MAX_RETRIES`)
- **Types/Interfaces**: Use PascalCase (`User`, `CreateUserData`)

### Import Aliases

**Always use import aliases** for local files:

```typescript
// ✅ CORRECT
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { UsersService } from '@/services/users.service';

// ❌ WRONG
import { Button } from '../../../components/ui/button';
import { api } from './lib/api';
```

### File Organization

- **No barrel files**: Don't create `index.ts` files for re-exports
- **Co-location**: Keep related files together (tests, styles, components)
- **Domain-based**: Organize by feature/domain, not by type
- **Direct imports**: Use explicit file paths, not directory imports

### Code Quality

- **Self-documenting code**: Write code that explains itself
- **Minimal comments**: Only comment non-obvious logic or "why" not "what"
- **No commented code**: Delete unused code, don't comment it out
- **Error handling**: Always handle errors explicitly
- **Type safety**: Prefer compile-time errors over runtime errors

### Validation

- **Zod everywhere**: Use Zod v4 for all validation
- **Schema-first**: Define Zod schemas, infer types from them
- **Shared schemas**: Define schemas in `packages/types`
- **Runtime validation**: Validate all user input and external data

---

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) for clear, structured commit messages.

### Commit Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, no logic change)
- **refactor**: Code refactoring (no feat/fix)
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks (dependencies, config)
- **ci**: CI/CD changes

### Examples

```bash
# Feature
feat(api): add email verification endpoint

# Bug fix
fix(frontend): resolve CORS issue with API calls

# Documentation
docs(readme): update installation instructions

# Refactoring
refactor(users): extract validation logic to service

# Multiple files
feat(auth): implement OAuth Google login
- Add Google OAuth provider configuration
- Create OAuth callback route
- Update Better Auth config
```

### Scope

Use the package or feature name:

- `api`, `frontend`, `types`, `utils`
- `auth`, `users`, `sessions`
- `docker`, `ci`, `deps`

---

## Pull Request Process

### Before Submitting

1. **Rebase on latest main**:

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run all checks**:

   ```bash
   pnpm typecheck  # Must pass
   pnpm lint       # Must pass
   pnpm test       # Must pass
   pnpm build      # Must succeed
   ```

3. **Update documentation**:
   - Update `CLAUDE.md` if adding new patterns
   - Update `README.md` if changing setup process
   - Add JSDoc comments for public APIs

### Pull Request Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Lint checks passing

## Testing

How to test these changes

## Screenshots (if applicable)

Add screenshots for UI changes
```

### Review Process

1. **Automated checks**: CI must pass (typecheck, lint, test, build)
2. **Code review**: At least one approval required
3. **Address feedback**: Make requested changes
4. **Squash commits**: Maintainers will squash before merging
5. **Merge**: Maintainers merge to main

---

## Project Structure

### Monorepo Layout

```
arawn/
├── apps/
│   ├── frontend/          # Next.js 15 frontend
│   │   ├── src/
│   │   │   ├── app/       # App router pages
│   │   │   ├── components/# React components
│   │   │   ├── hooks/     # Custom hooks
│   │   │   ├── lib/       # Utilities & config
│   │   │   └── styles/    # Global styles
│   │   └── public/        # Static assets
│   │
│   └── api/               # Fastify API
│       ├── src/
│       │   ├── routes/    # API route handlers
│       │   ├── services/  # Business logic
│       │   ├── plugins/   # Fastify plugins
│       │   ├── hooks/     # Request/response hooks
│       │   ├── common/    # Shared utilities
│       │   └── config/    # Configuration
│       ├── prisma/        # Database schema & migrations
│       └── test/          # Tests & test utilities
│
├── packages/
│   ├── types/             # Shared Zod schemas & types
│   └── utils/             # Shared utility functions
│
├── config/                # Shared build configs
├── scripts/               # Setup & automation scripts
└── docker-compose.yml     # Development environment
```

### Adding a New Feature

#### API Feature

1. **Define types** in `packages/types/src/`:

   ```typescript
   export const CreateFeatureSchema = z.object({
     name: z.string().min(1),
   });
   export type CreateFeature = z.infer<typeof CreateFeatureSchema>;
   ```

2. **Create service** in `apps/api/src/services/`:

   ```typescript
   export class FeaturesService {
     constructor(
       private readonly prisma: PrismaClient,
       private readonly logger: LoggerService
     ) {
       this.logger.setContext('FeaturesService');
     }
     // ... methods
   }
   ```

3. **Create routes** in `apps/api/src/routes/`:

   ```typescript
   const featuresRoutes: FastifyPluginAsync = async (app) => {
     const server = app.withTypeProvider<ZodTypeProvider>();

     server.post(
       '/features',
       {
         schema: {
           body: CreateFeatureSchema,
           tags: ['Features'],
         },
       },
       async (request, reply) => {
         // handler
       }
     );
   };
   ```

4. **Register service** in `apps/api/src/main.ts`

5. **Add tests**:
   - Unit tests: `apps/api/src/services/features.service.spec.ts`
   - Integration tests: `apps/api/test/integration/features.integration.spec.ts`

#### Frontend Feature

1. **Create component** in `apps/frontend/src/components/`:

   ```typescript
   export function FeatureList() {
     // component logic
   }
   ```

2. **Create API hook** in `apps/frontend/src/hooks/api/`:

   ```typescript
   export function useFeatures() {
     return useQuery({
       queryKey: ['features'],
       queryFn: () => api.get('/features'),
     });
   }
   ```

3. **Add page** in `apps/frontend/src/app/features/page.tsx`

4. **Add tests** in `apps/frontend/src/components/__tests__/`

---

## Testing Guidelines

### Test Types

- **Unit Tests** (`*.spec.ts`): Test business logic with mocked dependencies
- **Integration Tests** (`*.integration.spec.ts`): Test with real database
- **Component Tests** (`*.test.tsx`): Test React components

### Writing Tests

```typescript
// Unit test example
describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaClient;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new UsersService(prisma, createMockLogger());
  });

  it('should create user', async () => {
    // Arrange
    const data = { email: 'test@example.com', name: 'Test' };
    vi.mocked(prisma.user.create).mockResolvedValue(mockUser);

    // Act
    const user = await service.createUser(data);

    // Assert
    expect(user.email).toBe('test@example.com');
  });
});
```

### Running Tests

```bash
# All tests
pnpm test

# Specific package
pnpm --filter @repo/api test

# Watch mode
pnpm test --watch

# Coverage
pnpm test:coverage

# Integration tests only
pnpm test test/integration

# Keep test database for debugging
KEEP_TEST_DB=true pnpm test
```

---

## Documentation

### Code Documentation

- **Public APIs**: Add JSDoc comments
- **Complex logic**: Explain the "why" not the "what"
- **Examples**: Provide usage examples for utilities

```typescript
/**
 * Create a new user with the provided data
 * @param data - User creation data (email, name, role)
 * @returns Created user object
 * @throws {ValidationError} If data is invalid
 */
async createUser(data: CreateUser): Promise<User> {
  // implementation
}
```

### Documentation Files

- **CLAUDE.md**: Architecture, patterns, and AI context
- **README.md**: Quick start and overview
- **DEPLOYMENT.md**: Deployment guides
- **CONTRIBUTING.md**: This file

### Updating Documentation

When adding features:

- Update `CLAUDE.md` with new patterns
- Add examples to relevant sections
- Update README if changing setup
- Keep documentation concise and actionable

---

## Getting Help

- **GitHub Issues**: Report bugs or request features
- **GitHub Discussions**: Ask questions or discuss ideas
- **Documentation**: Check `CLAUDE.md` for detailed architecture info
- **Code Examples**: Browse `apps/api/src/routes/` and `apps/frontend/src/`

---

## License

By contributing to Arawn, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

Thank you for contributing to Arawn! 🚀
