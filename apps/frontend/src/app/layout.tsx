import type { Metadata } from 'next';
import { Providers } from '@/providers';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

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
      <body>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
