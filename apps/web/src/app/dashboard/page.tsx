'use client';

import { Button } from '@repo/packages-ui/button';
import { Skeleton } from '@repo/packages-ui/skeleton';
import { UserAvatar } from '@repo/packages-ui/user-avatar';
import {
  formatDateTime,
  formatShortDate,
  getRelativeTime,
} from '@repo/packages-utils/date';
import {
  Calendar,
  Clock,
  KeyRound,
  LogOut,
  Mail,
  ShieldCheck,
  ShieldUser,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

import { EmailVerificationBanner } from '@/components/auth/email-verification-banner';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { authClient } from '@/lib/auth';

function DashboardContent() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push('/');
  };

  if (!session) return null;

  const accountCreatedDate = session.user.createdAt
    ? formatShortDate(session.user.createdAt)
    : 'N/A';

  const lastLoginDate = session.session.createdAt
    ? getRelativeTime(session.session.createdAt, { alwaysShowTime: true })
    : 'N/A';

  const sessionExpiresDate = session.session.expiresAt
    ? formatDateTime(session.session.expiresAt)
    : 'N/A';

  const isEmailVerified = session.user.emailVerified;
  const isAdmin =
    session.user.role === 'admin' || session.user.role === 'super_admin';

  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-8">
      <div className="mb-4">
        <EmailVerificationBanner />
      </div>

      <div className="flex items-center gap-4">
        <UserAvatar
          src={session.user.image}
          name={session.user.name}
          email={session.user.email}
        />
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {session.user.name || 'User'}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your account
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="border-border bg-card rounded-lg border p-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary rounded-full p-3">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Account Created
              </p>
              <p className="text-lg font-semibold">{accountCreatedDate}</p>
            </div>
          </div>
        </div>

        <div className="border-border bg-card rounded-lg border p-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary rounded-full p-3">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Last Login
              </p>
              <p className="text-lg font-semibold">{lastLoginDate}</p>
            </div>
          </div>
        </div>

        <div className="border-border bg-card rounded-lg border p-6">
          <div className="flex items-center gap-3">
            <div
              className={`rounded-full p-3 ${
                isEmailVerified
                  ? 'bg-green-500/10 text-green-600 dark:text-green-500'
                  : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500'
              }`}
            >
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Email Status
              </p>
              <p className="text-lg font-semibold">
                {isEmailVerified ? 'Verified' : 'Not Verified'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="border-border bg-card rounded-lg border p-8">
          <div className="mb-4 flex items-center gap-2">
            <User className="text-primary h-5 w-5" />
            <h2 className="text-lg font-semibold">User Information</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="text-muted-foreground mt-0.5 h-4 w-4" />
              <div className="flex-1">
                <p className="text-muted-foreground text-xs font-medium">
                  Email Address
                </p>
                <p className="text-sm font-medium">{session.user.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="text-muted-foreground mt-0.5 h-4 w-4" />
              <div className="flex-1">
                <p className="text-muted-foreground text-xs font-medium">
                  Display Name
                </p>
                <p className="text-sm font-medium">
                  {session.user.name || (
                    <span className="text-muted-foreground italic">
                      Not set
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldUser className="text-muted-foreground mt-0.5 h-4 w-4" />
              <div className="flex-1">
                <p className="text-muted-foreground text-xs font-medium">
                  Role
                </p>
                <p className="text-sm font-medium capitalize">
                  {session.user.role || 'User'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-border bg-card rounded-lg border p-8">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="text-primary h-5 w-5" />
            <h2 className="text-lg font-semibold">Session Details</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="text-muted-foreground mt-0.5 h-4 w-4" />
              <div className="flex-1">
                <p className="text-muted-foreground text-xs font-medium">
                  Session Created
                </p>
                <p className="text-sm font-medium">
                  {formatDateTime(session.session.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="text-muted-foreground mt-0.5 h-4 w-4" />
              <div className="flex-1">
                <p className="text-muted-foreground text-xs font-medium">
                  Session Expires
                </p>
                <p className="text-sm font-medium">{sessionExpiresDate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-border bg-card rounded-lg border p-8">
        <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {isAdmin && (
            <Link href="/admin">
              <Button variant="default" className="gap-2">
                <ShieldCheck className="h-4 w-4" />
                Admin Dashboard
              </Button>
            </Link>
          )}
          <Link href="/dashboard/change-password">
            <Button variant="default" className="gap-2">
              <KeyRound className="h-4 w-4" />
              Change Password
            </Button>
          </Link>
          <Button onClick={handleSignOut} variant="outline" className="gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-8">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border-border bg-card rounded-lg border p-6">
            <div className="flex items-center gap-3">
              <Skeleton className="h-11 w-11 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-32" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="border-border bg-card rounded-lg border p-8">
            <div className="mb-4 flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-6 w-40" />
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="flex items-start gap-3">
                  <Skeleton className="mt-0.5 h-4 w-4 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-border bg-card rounded-lg border p-8">
        <Skeleton className="mb-4 h-6 w-32" />
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-10 w-40 rounded-md" />
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute redirectTo="/login" fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </ProtectedRoute>
  );
}
