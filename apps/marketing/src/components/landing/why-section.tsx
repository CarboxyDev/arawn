import {
  Check,
  Clock,
  Copy,
  Database,
  LayoutDashboard,
  Rocket,
  Server,
  Settings,
  ShieldCheck,
  X,
} from 'lucide-react';
import React from 'react';

const iconMap = {
  Clock,
  Copy,
  Database,
  Settings,
  ShieldCheck,
  Server,
  LayoutDashboard,
  Rocket,
} as const;

const WHY_SECTION = {
  kicker: 'From zero to production in 4 commands',
  problems: [
    {
      text: 'Days wasted on boilerplate setup',
      iconName: 'Clock' as const,
    },
    {
      text: 'Copy-pasting auth for the 10th time',
      iconName: 'Copy' as const,
    },
    {
      text: 'Yet another database migration setup',
      iconName: 'Database' as const,
    },
    {
      text: 'Fighting with monorepo configurations',
      iconName: 'Settings' as const,
    },
  ],
  solutions: [
    {
      text: 'Fully configured authentication system',
      iconName: 'ShieldCheck' as const,
    },
    {
      text: 'Production-ready API with logging, security, docs',
      iconName: 'Server' as const,
    },
    {
      text: 'Working admin dashboard on day one',
      iconName: 'LayoutDashboard' as const,
    },
    {
      text: 'Just add your features and ship',
      iconName: 'Rocket' as const,
    },
  ],
} as const;

export function WhySection(): React.ReactElement {
  return (
    <div className="space-y-12">
      <div className="text-center">
        <h2 className="text-foreground mb-4 text-3xl font-semibold tracking-tight lg:text-4xl">
          Why Blitzpack?
        </h2>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
          Stop repeating the same setup tasks. Start building features that
          matter.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Problems Column */}
        <div className="border-border bg-destructive/5 border-l-destructive/50 space-y-6 rounded-lg border border-l-8 p-8">
          <div className="flex items-center gap-3">
            <div className="bg-destructive/10 text-destructive flex h-10 w-10 items-center justify-center rounded-full">
              <X className="h-5 w-5" />
            </div>
            <h3 className="text-foreground text-xl font-medium">The Problem</h3>
          </div>
          <ul className="space-y-4">
            {WHY_SECTION.problems.map((problem) => {
              const Icon = iconMap[problem.iconName];
              return (
                <li key={problem.text} className="flex items-start gap-3">
                  <Icon className="text-muted-foreground mt-1 h-5 w-5 flex-shrink-0" />
                  <span className="text-foreground">{problem.text}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Solutions Column */}
        <div className="border-border bg-primary/5 border-l-primary space-y-6 rounded-lg border border-l-8 p-8">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
              <Check className="h-5 w-5" />
            </div>
            <h3 className="text-foreground text-xl font-medium">
              The Solution
            </h3>
          </div>
          <ul className="space-y-4">
            {WHY_SECTION.solutions.map((solution) => {
              const Icon = iconMap[solution.iconName];
              return (
                <li key={solution.text} className="flex items-start gap-3">
                  <Icon className="text-muted-foreground mt-1 h-5 w-5 flex-shrink-0" />
                  <span className="text-foreground">{solution.text}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Kicker */}
      <div className="text-center">
        <p className="text-primary text-xl font-medium">{WHY_SECTION.kicker}</p>
      </div>
    </div>
  );
}
