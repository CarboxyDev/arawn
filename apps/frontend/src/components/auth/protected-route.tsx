'use client';

import { useRouter } from 'next/navigation';
import { type ReactNode, useEffect } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { authClient } from '@/lib/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
  fallback?: ReactNode;
  requiredRole?: 'admin' | 'super_admin';
  loadingMessage?: string;
}

export function ProtectedRoute({
  children,
  redirectTo = '/login',
  fallback,
  requiredRole,
  loadingMessage,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.push(redirectTo);
    } else if (!isPending && session && requiredRole) {
      const userRole = (session.user as { role?: string }).role;
      if (userRole !== requiredRole && userRole !== 'super_admin') {
        router.push(redirectTo);
      }
    }
  }, [session, isPending, router, redirectTo, requiredRole]);

  if (isPending) {
    return (
      fallback || (
        <div className="container mx-auto max-w-4xl p-8">
          <div className="bg-card rounded-lg border p-6 shadow-sm">
            <div className="mb-4 space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>
      )
    );
  }

  if (!session) {
    return null;
  }

  if (requiredRole) {
    const userRole = (session.user as { role?: string }).role;
    if (userRole !== requiredRole && userRole !== 'super_admin') {
      return null;
    }
  }

  return <>{children}</>;
}
