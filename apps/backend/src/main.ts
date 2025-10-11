import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { loadEnv } from '@repo/shared-config';
import { apiReference } from '@scalar/nestjs-api-reference';

import { AppModule } from './app.module';

async function bootstrap() {
  const env = loadEnv();
  const app = await NestFactory.create(AppModule);

  // CORS configuration
  app.enableCors({
    origin: env.FRONTEND_URL,
    credentials: true,
  });

  // OpenAPI configuration
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API documentation for the backend')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  app.use(
    '/docs',
    apiReference({
      spec: {
        content: document,
      },
      theme: 'purple',
      darkMode: true,
    })
  );

  await app.listen(env.PORT);
  console.log(`🚀 Application is running on: http://localhost:${env.PORT}`);
  console.log(
    `📚 API Documentation is running on: http://localhost:${env.PORT}/docs`
  );
}

bootstrap();
