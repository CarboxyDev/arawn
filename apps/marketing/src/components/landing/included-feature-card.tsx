import {
  LayoutDashboard,
  Lock,
  Mail,
  Server,
  Shield,
  ShieldCheck,
  Users,
  Wrench,
} from 'lucide-react';

const iconMap = {
  Lock,
  Shield,
  ShieldCheck,
  LayoutDashboard,
  Users,
  Server,
  Mail,
  Wrench,
} as const;

type IconName = keyof typeof iconMap;

interface IncludedFeatureCardProps {
  iconName: IconName;
  title: string;
  description: string;
}

export function IncludedFeatureCard({
  iconName,
  title,
  description,
}: IncludedFeatureCardProps) {
  const Icon = iconMap[iconName];

  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="mb-4">
        <Icon className="text-foreground h-5 w-5" />
      </div>
      <h3 className="text-card-foreground mb-2 text-base font-medium">
        {title}
      </h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}
