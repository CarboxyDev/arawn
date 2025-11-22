'use client';

import {
  LayoutDashboard,
  LogOut,
  ScrollText,
  ShieldCheck,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { type ReactNode } from 'react';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { UserAvatar } from '@/components/ui/user-avatar';
import { authClient } from '@/lib/auth';

const adminNavItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'User Management',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Audit Logs',
    href: '/admin/audit-logs',
    icon: ScrollText,
  },
];

function AdminLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push('/');
  };

  const userInitials = session?.user.name
    ? session.user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : session?.user.email?.charAt(0).toUpperCase() || 'A';

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="h-14 border-b px-6 py-0">
          <div className="flex h-full items-center gap-3">
            <div className="bg-primary flex size-9 items-center justify-center rounded-lg shadow-sm">
              <ShieldCheck className="text-primary-foreground size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Admin Dashboard</span>
              <span className="text-muted-foreground text-xs">
                Manage Application
              </span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="pt-4">
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 text-xs font-semibold uppercase tracking-wider">
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent className="mt-2">
              <SidebarMenu>
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                      >
                        <Link href={item.href}>
                          <Icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t p-4">
          <div className="flex items-center gap-3">
            <UserAvatar
              src={session?.user.image}
              alt={session?.user.name || 'Admin'}
              fallback={userInitials}
              className="size-8"
            />
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">
                {session?.user.name || 'Admin'}
              </p>
              <p className="text-muted-foreground truncate text-xs">
                {session?.user.email}
              </p>
            </div>
            <Button
              onClick={handleSignOut}
              variant="ghost"
              size="icon"
              className="size-8 shrink-0"
              title="Sign out"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="border-sidebar-border sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-white px-6 dark:bg-gray-950">
          <SidebarTrigger />
          <div className="flex-1" />
        </header>
        <div className="flex-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiredRole="admin" redirectTo="/dashboard">
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </ProtectedRoute>
  );
}
