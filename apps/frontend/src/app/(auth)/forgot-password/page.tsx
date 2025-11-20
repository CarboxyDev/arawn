'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { RedirectIfAuthenticated } from '@/components/auth/redirect-if-authenticated';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authClient } from '@/lib/auth';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);

    try {
      const result = await authClient.forgetPassword({
        email: data.email,
        redirectTo: '/reset-password',
      });

      if (result.error) {
        toast.error(result.error.message || 'Failed to send reset email');
        return;
      }

      setEmailSent(true);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Forgot password error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <RedirectIfAuthenticated>
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-lg border p-6 shadow-sm">
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
                    d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold">Check your email</h1>
              <p className="text-muted-foreground mt-2 text-sm">
                We sent a password reset link to
              </p>
              <p className="text-foreground mt-1 font-medium">
                {getValues('email')}
              </p>
            </div>
            <div className="bg-muted/50 space-y-2 rounded-lg p-4">
              <p className="text-muted-foreground text-sm">
                Click the link in the email to reset your password. The link
                will expire in 1 hour.
              </p>
              <p className="text-muted-foreground text-sm">
                Didn't receive the email? Check your spam folder or try again.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setEmailSent(false)}
              >
                Send another email
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
      </RedirectIfAuthenticated>
    );
  }

  return (
    <RedirectIfAuthenticated>
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="bg-card w-full max-w-md rounded-lg border p-6 shadow-sm">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold">Reset your password</h1>
            <p className="text-muted-foreground text-sm">
              Enter your email address and we'll send you a link to reset your
              password
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...register('email')}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-destructive text-sm">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="flex flex-col space-y-4 pt-2">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send reset link'}
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
    </RedirectIfAuthenticated>
  );
}
