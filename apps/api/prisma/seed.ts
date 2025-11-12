import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const superAdminEmail = 'admin@example.com';
  const superAdminPassword = 'Admin@123456';

  const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {
      role: Role.super_admin,
    },
    create: {
      email: superAdminEmail,
      name: 'Super Admin',
      role: Role.super_admin,
      emailVerified: true,
    },
  });

  await prisma.account.upsert({
    where: {
      providerId_accountId: {
        providerId: 'credential',
        accountId: superAdmin.id,
      },
    },
    update: {
      password: hashedPassword,
    },
    create: {
      userId: superAdmin.id,
      accountId: superAdmin.id,
      providerId: 'credential',
      password: hashedPassword,
    },
  });

  console.log('✅ Super admin user created:');
  console.log(`   Email: ${superAdminEmail}`);
  console.log(`   Password: ${superAdminPassword}`);
  console.log(`   Role: ${superAdmin.role}`);
  console.log('');
  console.log(
    '⚠️  IMPORTANT: Change the super_admin password after first login!'
  );

  const usersData = [
    { email: 'alice@example.com', name: 'Alice Johnson', role: Role.user },
    { email: 'bob@example.com', name: 'Bob Smith', role: Role.admin },
    { email: 'charlie@example.com', name: 'Charlie Davis', role: Role.user },
  ];

  for (const user of usersData) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }

  console.log(`✅ Seeded ${usersData.length} additional users`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
