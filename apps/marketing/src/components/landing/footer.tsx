'use client';

import { GitHubIcon, XAppIcon } from '@repo/packages-ui/icons';
import { motion } from 'framer-motion';
import { Coffee } from 'lucide-react';
import React from 'react';

import { siteConfig } from '@/config/site';

const item = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
    },
  },
};

export function Footer(): React.ReactElement {
  return (
    <footer className="border-border border-t py-16">
      <motion.div
        variants={item}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-50px' }}
        className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 px-8 sm:flex-row"
      >
        <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
          Made by{' '}
          <a
            href={siteConfig.author.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:text-primary transition-colors"
          >
            {siteConfig.author.name}
          </a>{' '}
          with{' '}
          <a
            href="https://en.wikipedia.org/wiki/Coffee"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary text-foreground inline-flex transition-colors"
            aria-label="Coffee"
          >
            <Coffee className="size-4" />
          </a>
        </p>

        <div className="flex items-center gap-4">
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
            <a
              href={siteConfig.author.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <GitHubIcon className="size-5" />
            </a>
          </motion.div>
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
            <a
              href={siteConfig.author.x}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="X / Twitter"
            >
              <XAppIcon className="size-4" />
            </a>
          </motion.div>
        </div>
      </motion.div>
    </footer>
  );
}
