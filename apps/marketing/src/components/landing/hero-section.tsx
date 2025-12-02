import { Button } from '@repo/packages-ui/button';
import { ArrowRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { AnimatedTerminal } from '@/components/landing/animated-terminal';
import { Logo } from '@/components/logo';
import { siteConfig } from '@/config/site';

export function HeroSection(): React.ReactElement {
  return (
    <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
      <div className="flex flex-col justify-center space-y-8">
        <div className="flex justify-center lg:justify-start">
          <Logo />
        </div>

        <div className="space-y-4">
          <h1 className="text-foreground text-center text-5xl font-semibold tracking-tight lg:text-left lg:text-6xl">
            Ship production apps in minutes, not months
          </h1>
          <p className="text-muted-foreground text-center text-lg lg:text-left lg:text-xl">
            Stop wasting days on boilerplate. Blitzpack ships with
            authentication, admin dashboards, API infrastructure, and
            battle-tested features already configured and working.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
          <Button
            asChild
            size="lg"
            className="group transition-all hover:scale-105"
          >
            <Link href="#quick-start" className="flex items-center gap-2">
              Get Started
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="group transition-all hover:scale-105"
          >
            <a
              href={siteConfig.docs}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <ExternalLink className="size-4" />
              Documentation
            </a>
          </Button>
        </div>
      </div>

      <div className="flex items-center">
        <AnimatedTerminal />
      </div>
    </div>
  );
}
