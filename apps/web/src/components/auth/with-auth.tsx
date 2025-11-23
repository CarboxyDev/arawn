'use client';

import { type ComponentType, type ReactNode } from 'react';

import { ProtectedRoute } from '@/components/auth/protected-route';

interface WithAuthOptions {
  redirectTo?: string;
  fallback?: ReactNode;
}

export function withAuth<P extends object>(
  Component: ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const WrappedComponent = (props: P) => {
    return (
      <ProtectedRoute
        redirectTo={options.redirectTo}
        fallback={options.fallback}
      >
        <Component {...props} />
      </ProtectedRoute>
    );
  };

  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
}
