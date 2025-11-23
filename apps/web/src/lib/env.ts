import { z } from 'zod';

/**
 * Client-side environment variable validation
 *
 * IMPORTANT: Only NEXT_PUBLIC_* variables are exposed to the browser
 * All other env vars are server-side only and should NOT be included here
 */
const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z
    .string()
    .url('NEXT_PUBLIC_API_URL must be a valid URL')
    .min(1, 'NEXT_PUBLIC_API_URL is required'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

/**
 * Validate and parse environment variables
 * Throws if validation fails, preventing the app from running with invalid config
 */
function validateEnv() {
  try {
    return envSchema.parse({
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NODE_ENV: process.env.NODE_ENV,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:', error.issues);
      throw new Error(
        `Environment validation failed: ${error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`
      );
    }
    throw error;
  }
}

// Validate on module load (fails fast if config is wrong)
const validatedEnv = validateEnv();

// Environment helpers
export const isDevelopment = () => validatedEnv.NODE_ENV === 'development';
export const isProduction = () => validatedEnv.NODE_ENV === 'production';
export const isTest = () => validatedEnv.NODE_ENV === 'test';

// Client-side environment variables (type-safe and validated)
export const env = {
  apiUrl: validatedEnv.NEXT_PUBLIC_API_URL,
  nodeEnv: validatedEnv.NODE_ENV,
} as const;
