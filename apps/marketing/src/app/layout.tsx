import './globals.css';

import { Toaster } from '@repo/packages-ui/sonner';
import type { Metadata } from 'next';
import React from 'react';

import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Blitzpack - Full-stack TypeScript Monorepo Template',
  description:
    'Production-ready full-stack TypeScript monorepo template with Next.js, Fastify, Turborepo. Go from zero to production in minutes.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
