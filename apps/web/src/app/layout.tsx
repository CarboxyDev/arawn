import './globals.css';

import { Toaster } from '@repo/packages-ui/sonner';
import type { Metadata } from 'next';
import React from 'react';

import { Footer } from '@/components/layout/footer';
import { isDevelopment } from '@/lib/env';

import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Blitzpack',
  description: 'Production-ready TypeScript monorepo',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`flex min-h-screen flex-col ${isDevelopment() ? 'debug-screens' : ''}`}
      >
        <Providers>
          {children}
          <Footer />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
