'use client';

import { motion } from 'framer-motion';
import { ScrollText, Users } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const adminCards = [
  {
    title: 'User Management',
    description:
      'Manage users, roles, and permissions. View, edit, and delete user accounts.',
    icon: Users,
    href: '/admin/users',
  },
  {
    title: 'Audit Logs',
    description:
      'Track all user actions and system events. Monitor security and compliance.',
    icon: ScrollText,
    href: '/admin/audit-logs',
  },
];

export default function AdminDashboardPage(): React.ReactElement {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-semibold tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage your application, users, and monitor system activity
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {adminCards.map((card) => {
          const Icon = card.icon;

          return (
            <Link key={card.href} href={card.href}>
              <motion.div
                className="border-border bg-card rounded-lg border p-6 transition-colors"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <Icon className="text-foreground mb-3 h-5 w-5" />
                <h3 className="text-card-foreground mb-2 text-base font-medium">
                  {card.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {card.description}
                </p>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
