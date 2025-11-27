import 'dotenv-flow/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins';
import { Pool } from 'pg';

import { PrismaClient, Role } from '../src/generated/client/client.js';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  baseURL: 'http://localhost:8080',
  secret: 'temp-seed-secret',
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    admin({
      defaultRole: 'user',
      adminRoles: ['admin', 'super_admin'],
    }),
  ],
});

async function main() {
  console.log('🌱 Seeding database...');

  // SAFETY: Block seeding in production
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ SAFETY ERROR: Seed script is blocked in production!');
    console.error(
      '   Test accounts with weak passwords should NEVER be created in production.'
    );
    console.error(
      '   If you need to seed production data, create a separate seed-prod.ts file.'
    );
    process.exit(1);
  }

  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);

  // Delete all existing test accounts first
  await prisma.account.deleteMany({
    where: {
      providerId: 'credential',
      accountId: {
        in: [
          'admin@example.com',
          'alice@example.com',
          'bob@example.com',
          'charlie@example.com',
        ],
      },
    },
  });

  await prisma.user.deleteMany({
    where: {
      email: {
        in: [
          'admin@example.com',
          'alice@example.com',
          'bob@example.com',
          'charlie@example.com',
        ],
      },
    },
  });

  console.log('🗑️  Cleaned up existing test accounts');

  const usersData = [
    {
      email: 'admin@example.com',
      name: 'Super Admin',
      password: 'Admin@123456',
      role: Role.super_admin,
      emailVerified: true,
    },
    {
      email: 'alice@example.com',
      name: 'Alice Johnson',
      password: 'Alice@123456',
      role: Role.user,
      emailVerified: false,
    },
    {
      email: 'bob@example.com',
      name: 'Bob Smith',
      password: 'Bob@123456',
      role: Role.admin,
      emailVerified: false,
    },
    {
      email: 'charlie@example.com',
      name: 'Charlie Davis',
      password: 'Charlie@123456',
      role: Role.user,
      emailVerified: false,
    },
  ];

  for (const userData of usersData) {
    // Create user with Better Auth (this handles password hashing correctly)
    const response = await auth.api.signUpEmail({
      body: {
        email: userData.email,
        password: userData.password,
        name: userData.name,
      },
    });

    if (!response || !response.user) {
      console.error(`❌ Failed to create user: ${userData.email}`);
      continue;
    }

    // Update user role and email verification status
    await prisma.user.update({
      where: { id: response.user.id },
      data: {
        role: userData.role,
        emailVerified: userData.emailVerified,
      },
    });

    console.log(
      `✅ Created: ${userData.email} (${userData.role}) - emailVerified: ${userData.emailVerified}`
    );
  }

  console.log('');
  console.log('✅ Database seeded successfully!');
  console.log('');
  console.log('Test accounts:');
  console.log('  admin@example.com / Admin@123456 (super_admin)');
  console.log('  alice@example.com / Alice@123456 (user)');
  console.log('  bob@example.com / Bob@123456 (admin)');
  console.log('  charlie@example.com / Charlie@123456 (user)');
  console.log('');
  console.log('⚠️  IMPORTANT: Change passwords after first login!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
