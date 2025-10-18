import { createAuthClient } from 'better-auth/react';

import { env } from '@/lib/env';

/**
 * Better Auth client for authentication
 *
 * Type assertion is required due to TypeScript's isolatedModules limitation
 * with Better Auth's complex inferred types. The runtime functionality is unaffected.
 */
export const authClient = createAuthClient({
  baseURL: `${env.apiUrl}/api/auth`,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as any;
