'use client';

import Link from 'next/link';

import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import { Button } from '@/components/ui/button';

export function PageHeader() {
  return (
    <div className="absolute right-8 top-8 flex items-center gap-2">
      <Button asChild variant="default">
        <Link href="/login">Sign In</Link>
      </Button>
      <AnimatedThemeToggler />
    </div>
  );
}
