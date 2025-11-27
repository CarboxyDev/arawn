import 'dotenv-flow/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { execSync } from 'child_process';
import { Pool } from 'pg';

import { PrismaClient } from '@/generated/client/client.js';

let prisma: PrismaClient | null = null;
let pool: Pool | null = null;

/**
 * Get test database URL
 * Uses DATABASE_URL from env but appends _test suffix to database name
 */
function getTestDatabaseUrl(): string {
  const databaseUrl =
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres_dev_password@localhost:5432/app_dev';

  const url = new URL(databaseUrl);
  const dbName = url.pathname.slice(1);
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

  process.env.DATABASE_URL = testDatabaseUrl;

  try {
    // Run migrations on test database
    console.log('⏳ Running test database migrations...');
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: testDatabaseUrl },
    });

    pool = new Pool({ connectionString: testDatabaseUrl });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });

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

  if (pool) {
    await pool.end();
    pool = null;
  }

  if (process.env.KEEP_TEST_DB !== 'true') {
    try {
      const testDatabaseUrl = getTestDatabaseUrl();
      const url = new URL(testDatabaseUrl);
      const dbName = url.pathname.slice(1);

      url.pathname = '/postgres';
      const adminUrl = url.toString();

      console.log('⏳ Cleaning up test database...');

      const adminPool = new Pool({ connectionString: adminUrl });
      const adminAdapter = new PrismaPg(adminPool);
      const adminPrisma = new PrismaClient({ adapter: adminAdapter });

      await adminPrisma.$connect();
      await adminPrisma.$executeRawUnsafe(
        `DROP DATABASE IF EXISTS "${dbName}" WITH (FORCE);`
      );
      await adminPrisma.$disconnect();
      await adminPool.end();

      console.log('✅ Test database cleaned up');
    } catch (error) {
      console.warn('⚠️ Test database cleanup failed (usually okay)');
    }
  }
}

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
