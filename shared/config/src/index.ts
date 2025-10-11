import dotenvFlow from 'dotenv-flow';
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  API_URL: z.string().url(),
  DATABASE_URL: z.string().min(1),
  PORT: z.string().transform(Number).pipe(z.number().int().positive()),
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
