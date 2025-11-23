import { adminClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

import { env } from '@/lib/env';

export const authClient = createAuthClient({
  baseURL: `${env.apiUrl}/auth`,
  plugins: [adminClient()],
  // ! IMPORTANT: Enable credentials to send/receive cookies cross-domain
  fetchOptions: {
    credentials: 'include',
  },
});
