import './globals.css';

import type { Metadata } from 'next';
import React from 'react';

import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/sonner';
import { isDevelopment } from '@/lib/env';
import { Providers } from '@/providers';

export const metadata: Metadata = {
  title: 'Arawn',
  description: 'Production-ready TypeScript monorepo',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
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
