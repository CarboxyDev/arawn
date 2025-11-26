'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/packages-ui/button';
import { Label } from '@repo/packages-ui/label';
import { PasswordInput } from '@repo/packages-ui/password-input';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { authClient } from '@/lib/auth';

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const token = searchParams.get('token');
  const error = searchParams.get('error');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
    },
  });

  const hasErrors = Object.keys(errors).length > 0;

  if (!token || error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="bg-card w-full max-w-md rounded-lg border p-8">
          <div className="mb-6 text-center">
            <div className="bg-destructive/10 text-destructive mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-7 w-7"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold">Invalid reset link</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              This password reset link is invalid or has expired.
            </p>
          </div>
          <div className="bg-muted/50 mb-6 space-y-2 rounded-lg p-4">
            <p className="text-muted-foreground text-sm">
              Password reset links expire after 1 hour for security reasons.
            </p>
            <p className="text-muted-foreground text-sm">
              Please request a new password reset link to continue.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button
              className="w-full"
              onClick={() => router.push('/forgot-password')}
            >
              Request new reset link
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => router.push('/login')}
            >
              Back to sign in
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error('Reset token is missing');
      return;
    }

    setIsLoading(true);

    try {
      const result = await authClient.resetPassword({
        newPassword: data.password,
        token,
      });

      if (result.error) {
        toast.error(result.error.message || 'Failed to reset password');
        return;
      }

      setResetSuccess(true);
      toast.success('Password reset successful!');
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Reset password error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (resetSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="bg-card w-full max-w-md rounded-lg border p-8">
          <div className="mb-6 text-center">
            <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-7 w-7"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold">
              Password reset successful
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Your password has been successfully reset. You can now sign in
              with your new password.
            </p>
          </div>
          <Button className="w-full" onClick={() => router.push('/login')}>
            Continue to sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-lg border p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Create new password</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Enter a new password for your account
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <PasswordInput
              id="password"
              placeholder="Enter your new password"
              {...register('password')}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-destructive text-xs">
                {errors.password.message}
              </p>
            )}
          </div>

          {hasErrors && (
            <div className="border-destructive/50 bg-destructive/5 rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <ShieldAlert className="text-destructive mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="text-destructive text-sm font-medium">
                    Password requirements:
                  </p>
                  <ul className="text-destructive/80 mt-1.5 space-y-1 text-sm">
                    <li>• At least 8 characters long</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {!hasErrors && (
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-muted-foreground text-sm font-medium">
                Password requirements:
              </p>
              <ul className="text-muted-foreground mt-2 space-y-1 text-sm">
                <li>• At least 8 characters long</li>
              </ul>
            </div>
          )}
          <div className="flex flex-col gap-4 pt-2">
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Reset password
            </Button>
            <p className="text-muted-foreground text-center text-sm">
              Remember your password?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
