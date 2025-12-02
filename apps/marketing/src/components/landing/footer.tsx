import { GitHubIcon } from '@repo/packages-ui/icons';
import { Twitter } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const FOOTER_CONFIG = {
  github: {
    url: 'https://github.com/CarboxyDev/blitzpack',
    label: 'GitHub',
  },
  twitter: {
    url: 'https://twitter.com/CarboxyDev',
    label: 'X / Twitter',
  },
  author: 'CarboxyDev',
} as const;

export function Footer(): React.ReactElement {
  return (
    <footer className="border-border border-t py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-8 sm:flex-row">
        <p className="text-muted-foreground text-sm">
          Made by{' '}
          <Link
            href={FOOTER_CONFIG.github.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:text-primary transition-colors hover:underline"
          >
            {FOOTER_CONFIG.author}
          </Link>
        </p>

        <div className="flex items-center gap-4">
          <Link
            href={FOOTER_CONFIG.github.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label={FOOTER_CONFIG.github.label}
          >
            <GitHubIcon className="h-5 w-5" />
          </Link>
          <Link
            href={FOOTER_CONFIG.twitter.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label={FOOTER_CONFIG.twitter.label}
          >
            <Twitter className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
