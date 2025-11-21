'use client';

import { AlertTriangle } from 'lucide-react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body>
        <div
          style={{
            display: 'flex',
            minHeight: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div
            style={{
              maxWidth: '28rem',
              width: '100%',
              padding: '2rem',
              border: '1px solid #e5e5e5',
              borderRadius: '0.5rem',
              backgroundColor: '#ffffff',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  marginBottom: '1rem',
                  padding: '1rem',
                  borderRadius: '9999px',
                  backgroundColor: '#f5f5f5',
                }}
              >
                <AlertTriangle
                  style={{ width: '2rem', height: '2rem', color: '#737373' }}
                />
              </div>
              <h1
                style={{
                  marginBottom: '0.5rem',
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#171717',
                }}
              >
                Critical error
              </h1>
              <p
                style={{
                  marginBottom: '1.5rem',
                  fontSize: '0.875rem',
                  lineHeight: '1.5',
                  color: '#737373',
                }}
              >
                A critical error occurred. Please refresh the page or contact
                support if the problem persists.
              </p>
              <button
                onClick={reset}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#ffffff',
                  backgroundColor: '#171717',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                }}
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
