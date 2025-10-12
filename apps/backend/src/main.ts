import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { loadEnv } from '@repo/shared-config';
import { apiReference } from '@scalar/nestjs-api-reference';
import helmet from 'helmet';

import { AppModule } from '@/app.module';
import { LoggerService } from '@/common/logger.service';
import { GlobalExceptionFilter } from '@/filters/http-exception.filter';

async function bootstrap() {
  const env = loadEnv();

  const logger = new LoggerService();
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });

  // Global exception filter for error handling
  app.useGlobalFilters(new GlobalExceptionFilter());

  app.use(
    helmet({
      contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
      crossOriginEmbedderPolicy:
        env.NODE_ENV === 'production' ? undefined : false,
    })
  );

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
  logger.log(`🚀 Server: http://localhost:${env.PORT}`, 'App');
  logger.log(`📚 Docs: http://localhost:${env.PORT}/docs`, 'App');
}

bootstrap();
