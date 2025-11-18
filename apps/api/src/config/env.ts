import dotenvFlow from 'dotenv-flow';
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  API_URL: z.string().url(),
  FRONTEND_URL: z.string().url(),
  DATABASE_URL: z.string().min(1),
  PORT: z.string().transform(Number).pipe(z.number().int().positive()),
  COOKIE_SECRET: z
    .string()
    .min(16, 'COOKIE_SECRET must be at least 16 characters'),
  LOG_LEVEL: z
    .enum(['minimal', 'normal', 'detailed', 'verbose'])
    .default('normal'),
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, 'BETTER_AUTH_SECRET must be at least 32 characters'),
  BETTER_AUTH_URL: z.string().url(),

  // OAuth Provider Credentials (Optional)
  // Only required if you enable social login providers in Better Auth configuration
  // Leave empty to use email/password authentication only
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Email Service Configuration (Optional)
  // If RESEND_API_KEY is not provided, emails will be logged to console (dev mode)
  // EMAIL_FROM: The sender email address (e.g., 'noreply@yourdomain.com')
  // Note: You MUST verify your domain in Resend dashboard before sending emails
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),

  // File Storage Configuration (Optional)
  STORAGE_TYPE: z.enum(['local', 's3', 'r2']).optional().default('local'),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_ENDPOINT: z.string().url().optional(), // For R2/MinIO compatibility
});

export type Env = z.infer<typeof EnvSchema>;

export function loadEnv(path?: string): Env {
  dotenvFlow.config({ path: path || process.cwd() });

  const result = EnvSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:', result.error.format());
    throw new Error('Invalid environment variables');
  }

  return result.data;
}
