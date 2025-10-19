'use client';

import { Monitor, Smartphone, Tablet, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useDeleteSession,
  useGetSessions,
  useRevokeAllSessions,
} from '@/hooks/api/use-sessions';
import { authClient } from '@/lib/auth';

function getDeviceIcon(userAgent: string | null) {
  if (!userAgent) return Monitor;

  const ua = userAgent.toLowerCase();
  if (
    ua.includes('mobile') ||
    ua.includes('android') ||
    ua.includes('iphone')
  ) {
    return Smartphone;
  }
  if (ua.includes('tablet') || ua.includes('ipad')) {
    return Tablet;
  }
  return Monitor;
}

function parseUserAgent(userAgent: string | null) {
  if (!userAgent) return 'Unknown Device';

  const ua = userAgent.toLowerCase();

  if (ua.includes('chrome')) return 'Chrome';
  if (ua.includes('firefox')) return 'Firefox';
  if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
  if (ua.includes('edge')) return 'Edge';
  if (ua.includes('opera')) return 'Opera';

  return 'Unknown Browser';
}

function SessionsContent() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { data: sessionsData, isLoading } = useGetSessions();
  const deleteSession = useDeleteSession();
  const revokeAll = useRevokeAllSessions();
  const [revokingAll, setRevokingAll] = useState(false);

  const currentSessionId = session?.session?.id;

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await deleteSession.mutateAsync(sessionId);
      toast.success('Session revoked successfully');
    } catch (error) {
      toast.error('Failed to revoke session');
    }
  };

  const handleRevokeAll = async () => {
    setRevokingAll(true);
    try {
      await revokeAll.mutateAsync();
      toast.success('All other sessions revoked successfully');
    } catch (error) {
      toast.error('Failed to revoke sessions');
    } finally {
      setRevokingAll(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl p-8">
        <div className="bg-card rounded-lg border p-6 shadow-sm">
          <Skeleton className="mb-6 h-8 w-48" />
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const sessions = sessionsData?.data || [];
  const activeSessions = sessions.filter(
    (s) => new Date(s.expiresAt) > new Date()
  );

  return (
    <div className="container mx-auto max-w-4xl p-8">
      <div className="bg-card rounded-lg border p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Active Sessions</h1>
            <p className="text-muted-foreground text-sm">
              Manage your active login sessions across devices
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>

        {activeSessions.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center">
            No active sessions found
          </div>
        ) : (
          <div className="space-y-4">
            {activeSessions.map((sessionItem) => {
              const isCurrent = sessionItem.id === currentSessionId;
              const DeviceIcon = getDeviceIcon(sessionItem.userAgent);
              const browser = parseUserAgent(sessionItem.userAgent);

              return (
                <div
                  key={sessionItem.id}
                  className="border-border flex items-start justify-between rounded-lg border p-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-muted rounded-lg p-2">
                      <DeviceIcon className="text-muted-foreground h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{browser}</p>
                        {isCurrent && (
                          <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm">
                        IP: {sessionItem.ipAddress || 'Unknown'}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Last active:{' '}
                        {new Date(sessionItem.updatedAt).toLocaleString()}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Expires:{' '}
                        {new Date(sessionItem.expiresAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {!isCurrent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevokeSession(sessionItem.id)}
                      disabled={deleteSession.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeSessions.length > 1 && (
          <div className="mt-6 border-t pt-6">
            <Button
              variant="destructive"
              onClick={handleRevokeAll}
              disabled={revokingAll}
            >
              {revokingAll ? 'Revoking...' : 'Sign Out All Other Devices'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SessionsPage() {
  return (
    <ProtectedRoute redirectTo="/login">
      <SessionsContent />
    </ProtectedRoute>
  );
}
