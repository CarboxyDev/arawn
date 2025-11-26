'use client';

import { Alert, AlertDescription, AlertTitle } from '@repo/packages-ui/alert';
import { Button } from '@repo/packages-ui/button';
import { AlertCircle, Mail } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { authClient } from '@/lib/auth';

export function EmailVerificationBanner() {
  const { data: session } = authClient.useSession();
  const [isResending, setIsResending] = useState(false);

  if (!session?.user || session.user.emailVerified) {
    return null;
  }

  const handleResendEmail = async () => {
    setIsResending(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/verification/resend`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to resend verification email');
      }

      toast.success('Verification email sent!', {
        description: 'Please check your inbox and spam folder.',
      });
    } catch (error) {
      toast.error('Failed to resend verification email', {
        description:
          error instanceof Error ? error.message : 'Please try again later',
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Alert className="border-amber-200 bg-amber-50">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-900">
        Email Verification Required
      </AlertTitle>
      <AlertDescription className="text-amber-700">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Please verify your email address ({session.user.email}) to access
            all features.
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResendEmail}
            disabled={isResending}
            className="border-amber-300 bg-white text-amber-900 hover:bg-amber-100"
          >
            {isResending ? (
              'Sending...'
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Resend Email
              </>
            )}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
