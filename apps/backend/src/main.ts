import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import * as path from 'path';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(path.join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  app.setGlobalPrefix('api');

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: [
      process.env['WEBSITE_URL'] ?? 'http://localhost:3000',
      process.env['ADMIN_URL'] ?? 'http://localhost:3001',
    ],
    credentials: true,
  });

  const port = process.env['PORT'] ?? 3002;
  await app.listen(port);
}

void bootstrap();
