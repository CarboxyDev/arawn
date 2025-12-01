import './globals.css';

import { Toaster } from '@repo/packages-ui/sonner';
import type { Metadata } from 'next';
import React from 'react';

import { isDevelopment } from '@/lib/env';
import { cn } from '@/lib/utils';

import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Blitzpack',
  description:
    'Full-stack TypeScript monorepo template with Next.js, Fastify, Turborepo. Production-ready auth, database, API docs, and testing. Go from zero to production in minutes.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'flex min-h-screen flex-col',
          isDevelopment() && 'debug-screens'
        )}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
