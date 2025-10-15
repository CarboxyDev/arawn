# Backend - NestJS API

Production-ready NestJS backend with TypeScript, Prisma, and PostgreSQL.

## Structure

```
src/
├── app.module.ts           # Root application module
├── app.controller.ts       # Root endpoints (/, /health)
├── app.service.ts          # Application-level services
├── main.ts                 # Application bootstrap
│
├── modules/                # Feature modules
│   └── users/             # User management module
│       ├── users.module.ts
│       ├── users.controller.ts
│       ├── users.service.ts
│       └── *.spec.ts
│
├── database/               # Database layer
│   └── prisma/            # Prisma ORM
│       ├── prisma.module.ts
│       └── prisma.service.ts
│
└── common/                 # Shared utilities
    ├── filters/           # Exception filters
    ├── guards/            # Authentication/authorization guards
    ├── interceptors/      # HTTP interceptors
    ├── middleware/        # Request middleware
    ├── decorators/        # Custom decorators
    ├── logger.service.ts  # Pino logger
    ├── logger.module.ts
    └── async-context.ts   # Request context

prisma/                     # Prisma schema (at backend root)
└── schema.prisma          # Database schema definition
```

## Development

```bash
# Install dependencies
pnpm install

# Start development server (port 8080)
pnpm dev

# Run tests
pnpm test

# Type check
pnpm typecheck

# Build for production
pnpm build

# Start production server
pnpm start
```

## Database

```bash
# Generate Prisma client
pnpm db:generate

# Create and apply migrations
pnpm db:migrate

# Push schema changes (no migration)
pnpm db:push

# Open Prisma Studio
pnpm db:studio

# Seed database
pnpm db:seed

# Reset database
pnpm db:reset
```

## Environment Variables

Copy `.env.local.example` to `.env.local` and configure:

```bash
# Server
NODE_ENV=development
PORT=8080
API_URL=http://localhost:8080
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://arawn:arawn_dev_password@localhost:5432/arawn_dev?sslmode=disable

# Logging
LOG_LEVEL=normal  # minimal | normal | detailed | verbose
```

## API Documentation

Once the server is running, API documentation is available at:

- **Swagger/Scalar UI**: http://localhost:8080/docs

## Adding New Modules

Follow the standard NestJS module pattern:

```bash
# 1. Create module directory
mkdir src/modules/posts

# 2. Create module files
touch src/modules/posts/posts.module.ts
touch src/modules/posts/posts.controller.ts
touch src/modules/posts/posts.service.ts
touch src/modules/posts/posts.controller.spec.ts
touch src/modules/posts/posts.service.spec.ts

# 3. Import module in app.module.ts
# Add: import { PostsModule } from '@/modules/posts/posts.module';
# Add PostsModule to imports array
```

## Architecture Patterns

### Module Structure

Each feature module follows this pattern:

- **Module**: Wires together controllers, services, and dependencies
- **Controller**: Handles HTTP requests/responses (thin layer)
- **Service**: Contains business logic
- **DTOs**: Created from Zod schemas using `createZodDto()`
- **Tests**: Unit tests for controller and service

### Validation

All API requests are validated using Zod schemas from `@repo/shared-types`:

```typescript
import { CreateUserSchema } from '@repo/shared-types';
import { createZodDto } from 'nestjs-zod';

class CreateUserDto extends createZodDto(CreateUserSchema) {}

@Post()
createUser(@Body() dto: CreateUserDto) {
  // dto is automatically validated
}
```

### Logging

Use the LoggerService for structured logging:

```typescript
import { LoggerService } from '@/common/logger.service';

@Injectable()
export class UsersService {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('UsersService');
  }

  someMethod() {
    this.logger.info('User created', { userId: 123 });
    this.logger.error('Failed to create user', error, {
      email: 'test@example.com',
    });
  }
}
```

### Error Handling

Throw NestJS exceptions for consistent error responses:

```typescript
import { NotFoundException, BadRequestException } from '@nestjs/common';

throw new NotFoundException('User not found');
throw new BadRequestException('Invalid email format');
```

## Security

- **Helmet**: Secure HTTP headers
- **CORS**: Strict origin policy (FRONTEND_URL only)
- **Rate Limiting**: 30 requests per 60 seconds per IP
- **Validation**: All inputs validated with Zod
- **Logging**: Request IDs and sanitized logging

## Testing

Tests use Vitest for fast execution:

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Set `LOG_LEVEL=minimal`
- [ ] Configure production `DATABASE_URL`
- [ ] Set secure `FRONTEND_URL`
- [ ] Run database migrations
- [ ] Enable SSL for PostgreSQL
- [ ] Configure proper CORS origins
- [ ] Review rate limiting settings
