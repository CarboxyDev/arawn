'use client';

import { motion } from 'framer-motion';
import {
  Bot,
  Code2,
  GitBranch,
  PackageOpen,
  Rocket,
  Shield,
  TestTube,
  Workflow,
  Zap,
} from 'lucide-react';

const iconMap = {
  Rocket,
  Zap,
  Shield,
  Workflow,
  Code2,
  TestTube,
  PackageOpen,
  GitBranch,
  Bot,
} as const;

type IconName = keyof typeof iconMap;

interface FeatureCardProps {
  iconName: IconName;
  title: string;
  description: string;
}

export function FeatureCard({
  iconName,
  title,
  description,
}: FeatureCardProps) {
  const Icon = iconMap[iconName];

  return (
    <motion.div
      className="border-border bg-card rounded-lg border p-6 transition-colors"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ duration: 0.2 }}
      >
        <Icon className="text-foreground mb-3 h-5 w-5" />
      </motion.div>
      <h3 className="text-card-foreground mb-2 text-base font-medium">
        {title}
      </h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}
