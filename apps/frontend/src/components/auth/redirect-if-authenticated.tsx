'use client';

import { useRouter } from 'next/navigation';
import { type ReactNode, useEffect } from 'react';

import { authClient } from '@/lib/auth';

interface RedirectIfAuthenticatedProps {
  children: ReactNode;
  redirectTo?: string;
}

export function RedirectIfAuthenticated({
  children,
  redirectTo = '/dashboard',
}: RedirectIfAuthenticatedProps) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && session) {
      router.replace(redirectTo);
    }
  }, [session, isPending, router, redirectTo]);

  if (isPending || session) {
    return null;
  }

  return <>{children}</>;
}
