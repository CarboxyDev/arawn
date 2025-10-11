'use client';

import { ThemeProvider } from 'next-themes';
import { QueryProvider } from './query-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </QueryProvider>
  );
}
