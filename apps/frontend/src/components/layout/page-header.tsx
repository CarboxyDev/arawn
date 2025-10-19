'use client';

import { Github } from 'lucide-react';

import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';

export function PageHeader() {
  return (
    <div className="absolute right-8 top-8 flex items-center gap-2">
      <Button asChild variant="default">
        <a
          href={siteConfig.github}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2"
        >
          <Github className="h-4 w-4" />
          GitHub
        </a>
      </Button>
      <AnimatedThemeToggler />
    </div>
  );
}
