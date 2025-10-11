import './globals.css';

import type { Metadata } from 'next';

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
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={isDevelopment() ? 'debug-screens' : ''}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
