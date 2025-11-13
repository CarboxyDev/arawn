import { adminClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

import { env } from '@/lib/env';

export const authClient = createAuthClient({
  baseURL: `${env.apiUrl}/api/auth`,
  plugins: [adminClient()],
  // CRITICAL: Enable credentials to send/receive cookies cross-domain
  fetchOptions: {
    credentials: 'include',
  },
});
