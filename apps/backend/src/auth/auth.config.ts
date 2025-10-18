import { PrismaClient } from '@prisma/client';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

import { PrismaService } from '@/database/prisma/prisma.service';

export function createAuthInstance(prisma: PrismaService) {
  // Cast PrismaService to PrismaClient for better-auth adapter compatibility
  const prismaClient = prisma as unknown as PrismaClient;

  return betterAuth({
    database: prismaAdapter(prismaClient, {
      provider: 'postgresql',
    }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false, // Set to true in production with email service
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // Update session every 24 hours
    },
    trustedOrigins: [process.env.FRONTEND_URL || 'http://localhost:3000'],
    socialProviders: {
      // OAuth providers will be added here
      // github: {
      //   clientId: process.env.GITHUB_CLIENT_ID!,
      //   clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      // },
      // google: {
      //   clientId: process.env.GOOGLE_CLIENT_ID!,
      //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // },
    },
  });
}

export type AuthInstance = ReturnType<typeof createAuthInstance>;
