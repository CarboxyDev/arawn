'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface ErrorCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actions?: ReactNode;
}

export function ErrorCard({
  icon: Icon,
  title,
  description,
  actions,
}: ErrorCardProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <motion.div
        className="border-border bg-card w-full max-w-md rounded-lg border p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <div className="flex flex-col items-center text-center">
          <motion.div
            className="bg-muted mb-4 rounded-full p-4"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Icon className="text-muted-foreground h-8 w-8" />
          </motion.div>
          <h1 className="text-card-foreground mb-2 text-2xl font-semibold">
            {title}
          </h1>
          <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
            {description}
          </p>
          {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
        </div>
      </motion.div>
    </div>
  );
}
