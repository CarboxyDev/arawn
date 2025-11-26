'use client';

import type { AdminSession } from '@repo/packages-types/session';
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

import { useRevokeSession } from '@/hooks/api/use-admin-sessions';

interface SessionRevokeDialogProps {
  session: AdminSession;
}

export function SessionRevokeDialog({ session }: SessionRevokeDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { mutate: revokeSession, isPending } = useRevokeSession();

  const handleRevoke = () => {
    revokeSession(session.id, {
      onSuccess: () => {
        toast.success('Session revoked successfully');
        setOpen(false);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to revoke session');
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Revoke
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Revoke this session?</AlertDialogTitle>
          <AlertDialogDescription>
            This will immediately log out{' '}
            <span className="font-semibold">
              {session.user.name || session.user.email}
            </span>{' '}
            from this device. They will need to sign in again to continue.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRevoke}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? 'Revoking...' : 'Revoke Session'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
