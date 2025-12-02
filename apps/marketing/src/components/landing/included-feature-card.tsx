import {
  Check,
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
  features?: readonly string[];
}

export function IncludedFeatureCard({
  iconName,
  title,
  description,
  features,
}: IncludedFeatureCardProps) {
  const Icon = iconMap[iconName];

  return (
    <div className="border-border bg-card hover:border-primary/30 group rounded-lg border p-6 transition-all hover:shadow-md">
      <div className="mb-4">
        <Icon className="text-primary h-5 w-5 transition-transform group-hover:scale-110" />
      </div>
      <h3 className="text-card-foreground mb-2 text-base font-medium">
        {title}
      </h3>
      <p className="text-muted-foreground mb-4 text-sm">{description}</p>

      {features && features.length > 0 && (
        <ul className="border-border space-y-2 border-t pt-4">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <Check className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
              <span className="text-muted-foreground text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
