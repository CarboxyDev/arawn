// Environment helpers
export const isDevelopment = () => process.env.NODE_ENV === 'development';
export const isProduction = () => process.env.NODE_ENV === 'production';
export const isTest = () => process.env.NODE_ENV === 'test';

// Client-side environment variables
// IMPORTANT: Only NEXT_PUBLIC_* variables are exposed to the browser
export const env = {
  apiUrl:
    process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.hostname}:8080`
      : 'http://localhost:8080'),
} as const;
