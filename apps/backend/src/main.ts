import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import helmet from 'helmet';
import { ZodValidationPipe } from 'nestjs-zod';

import { AppModule } from '@/app.module';
import { GlobalExceptionFilter } from '@/common/filters/http-exception.filter';
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';
import { LoggerService } from '@/common/logger.service';
import { loadEnv } from '@/config/env';

async function bootstrap() {
  const env = loadEnv();

  const logger = new LoggerService();
  logger.setContext('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });

  app.useGlobalFilters(new GlobalExceptionFilter());

  app.useGlobalInterceptors(new TransformInterceptor());

  app.useGlobalPipes(new ZodValidationPipe());

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
  logger.info(`Server running on http://localhost:${env.PORT}`);
  logger.info(
    `API documentation available at http://localhost:${env.PORT}/docs`
  );
  logger.info(`Log level: ${env.LOG_LEVEL}`);
}

bootstrap();
