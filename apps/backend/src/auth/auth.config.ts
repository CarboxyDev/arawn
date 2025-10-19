import { PrismaClient } from '@prisma/client';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins';

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
      requireEmailVerification: false, // IMPORTANT: Set to true in production with email service
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days (default session)
      updateAge: 60 * 60 * 24, // Update session every 24 hours
      cookieCache: {
        enabled: true,
        maxAge: 60 * 60 * 24 * 30, // 30 days when remember me is enabled
      },
    },
    trustedOrigins: [process.env.FRONTEND_URL || 'http://localhost:3000'],
    socialProviders: {
      // OAuth providers go here
      // github: {
      //   clientId: process.env.GITHUB_CLIENT_ID!,
      //   clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      // },
      // google: {
      //   clientId: process.env.GOOGLE_CLIENT_ID!,
      //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // },
    },
    plugins: [
      admin({
        defaultRole: 'user',
        adminRoles: ['admin', 'super_admin'],
      }),
    ],
  });
}

export type AuthInstance = ReturnType<typeof createAuthInstance>;
