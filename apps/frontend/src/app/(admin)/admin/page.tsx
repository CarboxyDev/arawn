'use client';

import { ScrollText, Users } from 'lucide-react';
import Link from 'next/link';

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const adminCards = [
  {
    title: 'User Management',
    description:
      'Manage users, roles, and permissions. View, edit, and delete user accounts.',
    icon: Users,
    href: '/admin/users',
    iconColor: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  {
    title: 'Audit Logs',
    description:
      'Track all user actions and system events. Monitor security and compliance.',
    icon: ScrollText,
    href: '/admin/audit-logs',
    iconColor: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-500/10',
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your application, users, and monitor system activity
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {adminCards.map((card) => {
          const Icon = card.icon;

          return (
            <Link key={card.href} href={card.href} className="group">
              <Card className="transition-all hover:scale-[1.02] hover:shadow-lg">
                <CardHeader>
                  <div className="mb-4 flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.bgColor}`}
                    >
                      <Icon className={`h-6 w-6 ${card.iconColor}`} />
                    </div>
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {card.title}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {card.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
