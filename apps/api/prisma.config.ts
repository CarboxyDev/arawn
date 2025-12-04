import { config } from 'dotenv';
import { defineConfig, env } from 'prisma/config';

if (!process.env.DATABASE_URL) {
  config({ path: '.env.local' });
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
