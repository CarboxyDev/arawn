import {
  LayoutDashboard,
  Lock,
  Shield,
  ShieldCheck,
  Users,
} from 'lucide-react';
import Link from 'next/link';

const iconMap = {
  Lock,
  Shield,
  ShieldCheck,
  LayoutDashboard,
  Users,
} as const;

type IconName = keyof typeof iconMap;

interface Page {
  name: string;
  href: string;
}

interface IncludedFeatureCardProps {
  iconName: IconName;
  title: string;
  pages: readonly Page[];
}

export function IncludedFeatureCard({
  iconName,
  title,
  pages,
}: IncludedFeatureCardProps) {
  const Icon = iconMap[iconName];

  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="mb-4">
        <Icon className="text-foreground h-5 w-5" />
      </div>

      <h3 className="text-card-foreground mb-4 text-base font-medium">
        {title}
      </h3>

      <div className="flex flex-wrap gap-2">
        {pages.map((page) => (
          <Link
            key={page.href}
            href={page.href}
            target="_blank"
            rel="noopener noreferrer"
            className="border-border hover:border-foreground/30 hover:bg-accent bg-background inline-flex items-center rounded-md border px-3 py-1.5 text-xs font-medium transition-colors"
          >
            {page.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
