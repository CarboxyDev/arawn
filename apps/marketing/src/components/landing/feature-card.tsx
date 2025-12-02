'use client';

import { motion } from 'framer-motion';
import {
  Bot,
  Code2,
  GitBranch,
  Lock,
  PackageOpen,
  Rocket,
  Shield,
  TestTube,
  Workflow,
  Zap,
} from 'lucide-react';

const iconMap = {
  Rocket,
  Lock,
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
      className="border-border bg-card hover:border-primary/50 group rounded-lg border p-6 transition-all hover:shadow-lg"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <Icon className="text-primary mb-3 h-5 w-5 transition-transform group-hover:scale-110" />
      <h3 className="text-card-foreground mb-2 text-base font-medium">
        {title}
      </h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}
