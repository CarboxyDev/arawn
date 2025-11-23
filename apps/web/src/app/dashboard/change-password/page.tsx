'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/packages-ui/button';
import { Checkbox } from '@repo/packages-ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/packages-ui/form';
import { PasswordInput } from '@repo/packages-ui/password-input';
import { ArrowLeft, CheckCircle2, KeyRound, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { ProtectedRoute } from '@/components/auth/protected-route';
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

  const form = useForm<ChangePasswordFormData>({
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
      form.reset();
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

  const hasErrors = Object.keys(form.formState.errors).length > 0;

  if (changeSuccess) {
    return (
      <ProtectedRoute redirectTo="/login">
        <div className="container mx-auto max-w-3xl space-y-6 p-8">
          <div className="border-border bg-card rounded-lg border p-8">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-600 dark:text-green-500">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h1 className="text-2xl font-bold">
                Password Changed Successfully
              </h1>
              <p className="text-muted-foreground mt-2">
                Your password has been updated. You can continue using your
                account with the new password.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                className="flex-1"
                onClick={() => router.push('/dashboard')}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute redirectTo="/login">
      <div className="container mx-auto max-w-3xl space-y-6 p-8">
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        <div className="border-border bg-card rounded-lg border p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="bg-primary/10 text-primary rounded-full p-3">
              <KeyRound className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Change Password</h1>
              <p className="text-muted-foreground">
                Update your password to keep your account secure
              </p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="Enter current password"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="Enter new password"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="Confirm new password"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        <li>• Different from current password</li>
                        <li>• Passwords must match</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="revokeOtherSessions"
                render={({ field }) => (
                  <FormItem className="border-border bg-muted/30 flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Sign out all other devices</FormLabel>
                      <FormDescription>
                        Recommended for security. This will end all active
                        sessions on other devices.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" isLoading={isLoading}>
                Change Password
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
