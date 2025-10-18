'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { authClient } from '@/lib/auth';

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
    }
  }, [session, isPending, router]);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push('/');
  };

  if (isPending) {
    return (
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
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-4xl p-8">
      <div className="bg-card rounded-lg border p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Welcome back, {session.user.name || session.user.email}!
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-muted-foreground text-sm font-medium">
              User Information
            </h3>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="font-medium">Email:</span> {session.user.email}
              </p>
              <p className="text-sm">
                <span className="font-medium">Name:</span>{' '}
                {session.user.name || 'Not set'}
              </p>
              <p className="text-sm">
                <span className="font-medium">User ID:</span> {session.user.id}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-muted-foreground text-sm font-medium">
              Session Information
            </h3>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="font-medium">Session ID:</span>{' '}
                {session.session.id}
              </p>
              <p className="text-sm">
                <span className="font-medium">Expires:</span>{' '}
                {new Date(session.session.expiresAt).toLocaleString()}
              </p>
            </div>
          </div>

          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
