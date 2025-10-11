import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { loadEnv } from '@repo/shared-config';

async function bootstrap() {
  const env = loadEnv();
  const app = await NestFactory.create(AppModule);

  await app.listen(env.PORT);
  console.log(`🚀 Application is running on: http://localhost:${env.PORT}`);
}

bootstrap();
