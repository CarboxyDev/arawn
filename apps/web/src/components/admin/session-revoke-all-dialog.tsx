'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@repo/packages-ui/alert-dialog';
import { Button } from '@repo/packages-ui/button';
import { LogOut } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import { useRevokeUserSessions } from '@/hooks/api/use-admin-sessions';

interface SessionRevokeAllDialogProps {
  userId: string;
  userName: string;
  userEmail: string;
}

export function SessionRevokeAllDialog({
  userId,
  userName,
  userEmail,
}: SessionRevokeAllDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { mutate: revokeUserSessions, isPending } = useRevokeUserSessions();

  const handleRevoke = () => {
    revokeUserSessions(userId, {
      onSuccess: () => {
        toast.success('All sessions revoked successfully');
        setOpen(false);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to revoke sessions');
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Revoke All
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Revoke all sessions for this user?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This will immediately log out{' '}
            <span className="font-semibold">{userName || userEmail}</span> from
            all devices. They will need to sign in again on each device.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRevoke}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? 'Revoking...' : 'Revoke All Sessions'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
