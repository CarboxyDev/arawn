import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

let prisma: PrismaClient | null = null;

/**
 * Get test database URL
 * Uses DATABASE_URL from env but appends _test suffix to database name
 */
function getTestDatabaseUrl(): string {
  const databaseUrl =
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres_dev_password@localhost:5432/app_dev';

  // Replace database name with _test suffix
  // Example: app_dev -> app_dev_test
  const url = new URL(databaseUrl);
  const dbName = url.pathname.slice(1); // Remove leading slash
  url.pathname = `/${dbName}_test`;

  return url.toString();
}

/**
 * Setup test database before running tests
 * - Sets up test database URL
 * - Runs migrations
 * - Creates Prisma client instance
 */
export async function setupTestDatabase(): Promise<void> {
  const testDatabaseUrl = getTestDatabaseUrl();

  // Set test database URL for Prisma
  process.env.DATABASE_URL = testDatabaseUrl;

  try {
    // Run migrations on test database
    console.log('⏳ Running test database migrations...');
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: testDatabaseUrl },
    });

    // Create Prisma client for tests
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: testDatabaseUrl,
        },
      },
    });

    await prisma.$connect();
    console.log('✅ Test database ready');
  } catch (error) {
    console.error('❌ Failed to setup test database:', error);
    throw error;
  }
}

/**
 * Cleanup test database after tests complete
 * - Disconnects Prisma client
 * - Optionally drops test database (set KEEP_TEST_DB=true to preserve)
 */
export async function cleanupTestDatabase(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }

  // Optional: Drop test database after tests
  // Set KEEP_TEST_DB=true to preserve database for inspection
  if (process.env.KEEP_TEST_DB !== 'true') {
    try {
      const testDatabaseUrl = getTestDatabaseUrl();
      const url = new URL(testDatabaseUrl);
      const dbName = url.pathname.slice(1);

      // Construct connection string to postgres database
      url.pathname = '/postgres';
      const adminUrl = url.toString();

      console.log('⏳ Cleaning up test database...');

      // Use Prisma to drop the database with FORCE to terminate connections
      const adminPrisma = new PrismaClient({
        datasources: { db: { url: adminUrl } },
      });

      await adminPrisma.$connect();
      await adminPrisma.$executeRawUnsafe(
        `DROP DATABASE IF EXISTS "${dbName}" WITH (FORCE);`
      );
      await adminPrisma.$disconnect();

      console.log('✅ Test database cleaned up');
    } catch (error) {
      // Ignore cleanup errors (database might not exist)
      console.warn('⚠️ Test database cleanup failed (this is usually ok)');
    }
  }
}

/**
 * Get Prisma client for integration tests
 * Returns the test database Prisma instance
 */
export function getTestPrisma(): PrismaClient {
  if (!prisma) {
    throw new Error(
      'Test database not initialized. Make sure setupTestDatabase() was called.'
    );
  }
  return prisma;
}

/**
 * Reset test database between tests
 * Truncates all tables while preserving schema
 */
export async function resetTestDatabase(): Promise<void> {
  const client = getTestPrisma();

  // Disable foreign key checks and truncate all tables at once
  // This is more efficient and avoids deadlocks
  await client.$executeRaw`
    TRUNCATE TABLE "verifications", "sessions", "accounts", "users" RESTART IDENTITY CASCADE;
  `;
}
