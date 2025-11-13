import { adminClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

import { env } from '@/lib/env';

export const authClient = createAuthClient({
  // env.apiUrl already includes /api (e.g., http://localhost:8080/api)
  baseURL: `${env.apiUrl}/auth`,
  plugins: [adminClient()],
  // CRITICAL: Enable credentials to send/receive cookies cross-domain
  fetchOptions: {
    credentials: 'include',
  },
});
