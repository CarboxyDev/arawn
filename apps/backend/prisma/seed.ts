import { PrismaClient } from '@prisma/client';
import { createMockUsersData } from '@repo/shared-utils';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Configure seed count via environment variable (default: 10)
  const userCount = Number(process.env.SEED_USER_COUNT) || 10;

  // Generate mock user data
  const usersData = createMockUsersData(userCount);

  // Create users in database
  const users = await prisma.user.createManyAndReturn({
    data: usersData,
  });

  console.log(`✅ Created ${users.length} users`);
  console.log('Sample users:', users.slice(0, 3));
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
