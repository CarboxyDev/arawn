'use client';

import { Button } from '@repo/packages-ui/button';
import { ServerCrash } from 'lucide-react';
import Link from 'next/link';

import { ErrorCard } from '@/components/error/error-card';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ reset }: ErrorProps) {
  return (
    <ErrorCard
      icon={ServerCrash}
      title="Something went wrong"
      description="An unexpected error occurred. Please try again or return to the home page."
      actions={
        <>
          <Button variant="outline" onClick={reset}>
            Try again
          </Button>
          <Button asChild>
            <Link href="/">Go home</Link>
          </Button>
        </>
      }
    />
  );
}
