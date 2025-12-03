'use client';

import { motion } from 'framer-motion';
import { Check, Copy, Terminal } from 'lucide-react';
import React, { useState } from 'react';

import { cn } from '@/lib/utils';

const COMMAND = 'pnpm create blitzpack';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
};

export function QuickStartSection() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(COMMAND);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-100px' }}
      className="relative space-y-12"
    >
      <div className="pointer-events-none absolute -inset-x-20 -inset-y-16 z-0 overflow-hidden rounded-2xl">
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundPosition: ['0px 0px', '40px 40px'],
          }}
          transition={{
            duration: 12,
            ease: 'linear',
            repeat: Infinity,
          }}
          style={{
            backgroundImage: `
              linear-gradient(to right, rgb(156 163 175 / 0.15) 1px, transparent 1px),
              linear-gradient(to bottom, rgb(156 163 175 / 0.15) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
        {/* Edge fade overlay for subtle fade effect */}
        <div className="from-background/80 to-background/80 absolute inset-0 bg-gradient-to-r via-transparent" />
        <div className="from-background/80 to-background/80 absolute inset-0 bg-gradient-to-b via-transparent" />
      </div>
      <motion.div variants={item} className="relative z-10 text-center">
        <div className="mb-4 flex items-center justify-center gap-3">
          <Terminal className="text-primary h-7 w-7 lg:h-8 lg:w-8" />
          <h2 className="text-foreground text-3xl font-semibold tracking-tight lg:text-5xl">
            Quick Start
          </h2>
        </div>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed">
          Get up and running in seconds. One command is all you need.
        </p>
      </motion.div>

      <motion.div variants={item} className="relative z-10 flex justify-center">
        <motion.div
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="group relative w-full max-w-3xl"
        >
          <div className="bg-card/50 border-primary/20 relative overflow-hidden rounded-2xl border backdrop-blur-xl">
            <div className="from-primary/5 to-primary/5 absolute inset-0 bg-gradient-to-br via-transparent" />

            <div className="relative flex flex-col items-center gap-6 p-6 sm:p-8 lg:flex-row lg:justify-between lg:p-10">
              <div className="flex items-center gap-3 font-mono text-base sm:gap-4 sm:text-lg lg:text-xl">
                <span className="text-primary font-bold">$</span>
                <span className="text-foreground break-all font-semibold tracking-wide sm:break-normal">
                  {COMMAND}
                </span>
              </div>

              <motion.button
                onClick={handleCopy}
                className={cn(
                  'group/btn relative flex h-12 w-40 cursor-pointer items-center justify-center gap-2.5 rounded-xl font-semibold shadow-lg transition-all duration-300',
                  copied
                    ? 'bg-emerald-500 text-white shadow-emerald-500/50 hover:bg-emerald-500/90'
                    : 'bg-primary text-primary-foreground shadow-primary/30 hover:bg-primary/90 hover:shadow-primary/50'
                )}
              >
                <motion.div
                  initial={false}
                  animate={{
                    scale: copied ? [1, 1.2, 1] : 1,
                    rotate: copied ? [0, -10, 10, 0] : 0,
                  }}
                  transition={{ duration: 0.4 }}
                >
                  {copied ? (
                    <Check className="size-5" strokeWidth={3} />
                  ) : (
                    <Copy className="size-5" />
                  )}
                </motion.div>
                <span className="text-base">{copied ? 'Copied!' : 'Copy'}</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
