'use client';

import { AnimatedThemeToggler } from '@repo/packages-ui/animated-theme-toggler';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/packages-ui/dropdown-menu';
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
} from '@repo/packages-ui/sidebar';
import { UserAvatar } from '@repo/packages-ui/user-avatar';
import { motion } from 'framer-motion';
import {
  ChevronsUpDown,
  LayoutDashboard,
  LogOut,
  ScrollText,
  ShieldCheck,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { type ReactNode } from 'react';

import { ProtectedRoute } from '@/components/auth/protected-route';
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
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <ShieldCheck className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Admin Panel</span>
                  <span className="truncate text-xs">Manage App</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
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
                        className="hover:bg-sidebar-accent/50 relative overflow-visible data-[active=true]:bg-transparent"
                      >
                        <Link href={item.href} className="relative z-20">
                          {isActive && (
                            <motion.div
                              layoutId="active-nav-item"
                              className="bg-sidebar-primary absolute inset-0 -z-10 rounded-md"
                              transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 30,
                              }}
                            />
                          )}
                          <motion.span
                            animate={{
                              color: isActive
                                ? 'var(--sidebar-primary-foreground)'
                                : 'var(--sidebar-foreground)',
                            }}
                            transition={{
                              duration: 0.2,
                              delay: isActive ? 0.1 : 0,
                            }}
                            className="flex items-center justify-center"
                          >
                            <Icon className="size-4" />
                          </motion.span>
                          <motion.span
                            animate={{
                              color: isActive
                                ? 'var(--sidebar-primary-foreground)'
                                : 'var(--sidebar-foreground)',
                            }}
                            transition={{
                              duration: 0.2,
                              delay: isActive ? 0.1 : 0,
                            }}
                            className="truncate"
                          >
                            {item.title}
                          </motion.span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <UserAvatar
                      src={session?.user.image}
                      alt={session?.user.name || 'Admin'}
                      fallback={userInitials}
                      className="h-8 w-8 rounded-lg"
                    />
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {session?.user.name || 'Admin'}
                      </span>
                      <span className="truncate text-xs">
                        {session?.user.email}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 size-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1" />
          <AnimatedThemeToggler />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="admin" redirectTo="/dashboard">
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </ProtectedRoute>
  );
}
