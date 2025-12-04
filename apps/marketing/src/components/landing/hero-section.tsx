'use client';

import { Button } from '@repo/packages-ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';

import { AnimatedTerminal } from '@/components/landing/animated-terminal';
import { Logo } from '@/components/logo';
import { siteConfig } from '@/config/site';

export function HeroSection() {
  return (
    <div className="space-y-12 lg:space-y-16">
      <div className="flex justify-center lg:justify-start">
        <Logo />
      </div>

      <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
        <div className="flex flex-col justify-center space-y-6 lg:space-y-8">
          <div className="space-y-4 lg:space-y-5">
            <h1 className="text-foreground text-center text-4xl font-bold leading-tight tracking-tight lg:text-left lg:text-5xl xl:text-6xl">
              Ship apps in{' '}
              <span className="text-primary relative">
                hours
                <span className="bg-primary/30 absolute inset-x-0 -bottom-1 h-0.5" />
              </span>
              , not months
            </h1>
            <p className="text-muted-foreground mx-auto max-w-xl text-center text-base leading-relaxed lg:mx-0 lg:text-left lg:text-lg">
              Stop wasting weeks on setting up your next project. Blitzpack
              ships with auth, API infrastructure, and battle-tested features
              already configured and working.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Button
              asChild
              size="lg"
              className="group h-11 px-8 text-base font-semibold shadow-lg transition-all hover:scale-105 hover:shadow-xl"
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
              className="hover:text-primary group h-11 px-6 transition-all hover:scale-105 hover:bg-transparent"
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

        <div className="flex items-center justify-center lg:justify-end">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.6,
              ease: 'easeOut',
            }}
            className="w-full"
            style={{
              filter:
                'drop-shadow(0 0 80px hsl(var(--primary) / 0.35)) drop-shadow(0 0 120px hsl(var(--primary) / 0.2))',
            }}
          >
            <AnimatedTerminal />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
