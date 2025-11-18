'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authClient } from '@/lib/auth';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    revokeOtherSessions: z.boolean(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [changeSuccess, setChangeSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      revokeOtherSessions: true,
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsLoading(true);

    try {
      const result = await authClient.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        revokeOtherSessions: data.revokeOtherSessions,
      });

      if (result.error) {
        toast.error(result.error.message || 'Failed to change password');
        return;
      }

      setChangeSuccess(true);
      reset();
      toast.success(
        data.revokeOtherSessions
          ? 'Password changed successfully! All other sessions have been signed out.'
          : 'Password changed successfully!'
      );
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Change password error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (changeSuccess) {
    return (
      <ProtectedRoute redirectTo="/login">
        <div className="container mx-auto max-w-2xl p-8">
          <div className="bg-card rounded-lg border p-6 shadow-sm">
            <div className="mb-6 text-center">
              <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4.5 12.75 6 6 9-13.5"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold">
                Password changed successfully
              </h1>
              <p className="text-muted-foreground mt-2 text-sm">
                Your password has been updated. You can continue using your
                account with the new password.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => router.push('/dashboard')}
              >
                Back to Dashboard
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setChangeSuccess(false)}
              >
                Change Again
              </Button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute redirectTo="/login">
      <div className="container mx-auto max-w-2xl p-8">
        <div className="mb-4">
          <Link
            href="/dashboard"
            className="text-muted-foreground hover:text-foreground flex items-center text-sm transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="mr-1 h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
            Back to Dashboard
          </Link>
        </div>
        <div className="bg-card rounded-lg border p-6 shadow-sm">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold">Change password</h1>
            <p className="text-muted-foreground text-sm">
              Update your password to keep your account secure
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="Enter current password"
                {...register('currentPassword')}
                disabled={isLoading}
              />
              {errors.currentPassword && (
                <p className="text-destructive text-sm">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                {...register('newPassword')}
                disabled={isLoading}
              />
              {errors.newPassword && (
                <p className="text-destructive text-sm">
                  {errors.newPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                {...register('confirmPassword')}
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="text-destructive text-sm">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
            <div className="bg-muted/50 space-y-3 rounded-lg p-4">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Password requirements:
                </p>
                <ul className="text-muted-foreground mt-2 list-inside list-disc space-y-1 text-sm">
                  <li>At least 8 characters long</li>
                  <li>Must be different from current password</li>
                  <li>Must match confirmation password</li>
                </ul>
              </div>
              <div className="border-muted border-t pt-3">
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="revokeOtherSessions"
                    className="border-input bg-background mt-0.5 h-4 w-4 rounded border"
                    {...register('revokeOtherSessions')}
                    disabled={isLoading}
                  />
                  <div>
                    <Label
                      htmlFor="revokeOtherSessions"
                      className="text-sm font-medium leading-none"
                    >
                      Sign out all other devices
                    </Label>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Recommended for security. This will end all active
                      sessions on other devices.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-4 pt-2">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Changing password...' : 'Change password'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
