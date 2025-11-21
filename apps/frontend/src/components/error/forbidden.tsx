import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';

import { ErrorCard } from '@/components/error/error-card';
import { Button } from '@/components/ui/button';

export function Forbidden() {
  return (
    <ErrorCard
      icon={ShieldAlert}
      title="Access denied"
      description="You don't have permission to access this page. Please contact an administrator if you believe this is an error."
      actions={
        <>
          <Button asChild variant="outline">
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
          <Button asChild>
            <Link href="/">Go home</Link>
          </Button>
        </>
      }
    />
  );
}
