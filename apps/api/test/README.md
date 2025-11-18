# API Testing Guide

This directory contains test utilities and integration tests for the API.

## Directory Structure

```
test/
├── helpers/
│   ├── test-db.ts          # Test database utilities
│   ├── mock-prisma.ts      # Mocked Prisma client for unit tests
│   └── mock-logger.ts      # Mocked logger for tests
├── integration/
│   └── *.integration.spec.ts  # Integration tests with real DB
├── setup.ts                # Global test setup (runs before all tests)
└── README.md               # This file
```

## Test Types

### Unit Tests (`src/**/*.spec.ts`)

- Use mocked dependencies
- Fast execution
- Test business logic in isolation
- Example: `src/services/users.service.spec.ts`

### Integration Tests (`test/integration/*.integration.spec.ts`)

- Use real PostgreSQL test database
- Test actual database operations
- Verify end-to-end functionality
- Example: `test/integration/users.integration.spec.ts`

## Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test users.service.spec.ts

# Run only integration tests
pnpm test test/integration

# Keep test database after tests (for debugging)
KEEP_TEST_DB=true pnpm test

# Generate coverage report
pnpm test:coverage
```

## Test Database

Integration tests use a separate PostgreSQL database:

- **Database Name**: `app_dev_test` (appends `_test` to your dev database)
- **Auto-setup**: Migrations run automatically before tests
- **Auto-cleanup**: Database dropped after tests (unless `KEEP_TEST_DB=true`)
- **Reset**: Each test can reset database with `resetTestDatabase()`

## Writing Integration Tests

```typescript
import { getTestPrisma, resetTestDatabase } from '@test/helpers/test-db';
import { createMockLogger } from '@test/helpers/mock-logger';
import { beforeEach, describe, expect, it } from 'vitest';

describe('My Integration Test', () => {
  beforeEach(async () => {
    // Reset database to clean state
    await resetTestDatabase();
  });

  it('should test database operation', async () => {
    const prisma = getTestPrisma();

    // Your test code here
    const user = await prisma.user.create({
      data: { email: 'test@example.com', name: 'Test' },
    });

    expect(user.email).toBe('test@example.com');
  });
});
```

## Test Utilities

### Test Database Helpers

```typescript
import { getTestPrisma, resetTestDatabase } from '@test/helpers/test-db';

// Get Prisma client for test database
const prisma = getTestPrisma();

// Reset database (truncate all tables)
await resetTestDatabase();
```

### Mock Helpers

```typescript
import { createMockPrisma } from '@test/helpers/mock-prisma';
import { createMockLogger } from '@test/helpers/mock-logger';

// For unit tests
const prisma = createMockPrisma();
const logger = createMockLogger();
```

## Best Practices

1. **Unit tests** for business logic and edge cases
2. **Integration tests** for database operations and transactions
3. Reset database between tests with `resetTestDatabase()`
4. Use `KEEP_TEST_DB=true` to inspect database after failed tests
5. Keep integration tests focused and fast
6. Clean up created data or use `resetTestDatabase()`
