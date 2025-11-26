'use client';

import { Button } from '@repo/packages-ui/button';
import { FileQuestion } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { ErrorCard } from '@/components/error/error-card';

export default function NotFound() {
  return (
    <ErrorCard
      icon={FileQuestion}
      title="Page not found"
      description="The page you're looking for doesn't exist or has been moved."
      actions={
        <>
          <Button variant="outline" onClick={() => window.history.back()}>
            Go back
          </Button>
          <Button asChild>
            <Link href="/">Go home</Link>
          </Button>
        </>
      }
    />
  );
}
