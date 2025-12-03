'use client';

import { Button } from '@repo/packages-ui/button';
import { GitHubIcon } from '@repo/packages-ui/icons/brand-icons';
import { Star } from 'lucide-react';
import { useEffect, useState } from 'react';

import { siteConfig } from '@/config/site';
export function GitHubStarButton() {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    fetch('https://api.github.com/repos/CarboxyDev/blitzpack')
      .then((res) => res.json())
      .then((data) => {
        if (data.stargazers_count !== undefined) {
          setStars(data.stargazers_count);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <Button asChild>
      <a
        href={siteConfig.github}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2"
      >
        <GitHubIcon className="size-4" />
        <span>Star on GitHub</span>
        {stars !== null && (
          <>
            <span className="text-muted-foreground">·</span>
            <span className="flex items-center gap-1">
              <Star className="size-3 fill-current" />
              {stars.toLocaleString()}
            </span>
          </>
        )}
      </a>
    </Button>
  );
}
