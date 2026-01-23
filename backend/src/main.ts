import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { exec } from 'child_process';
import * as express from 'express';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  console.log('=== STARTING SERVER ===');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('PORT from env:', process.env.PORT);
  console.log('Current directory:', process.cwd());

  try {
    console.log('Creating NestFactory...');
    console.log('This may take a moment while connecting to database...\n');

    const startTime = Date.now();
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: ['error', 'warn', 'log', 'debug'],
      bodyParser: true,
    });
    const initTime = Date.now() - startTime;

    // Настраиваем статическую раздачу файлов по пути /uploads/...
    app.useStaticAssets(join(process.cwd(), 'uploads'), {
      prefix: '/uploads/',
    });

    console.log(`✓ AppModule created successfully (took ${initTime}ms)`);

    // Увеличиваем лимит размера тела запроса для загрузки изображений (10MB)
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    console.log('ValidationPipe configured');

    // CORS настройки для Telegram WebApp
    // Разрешаем все origin, так как мини-приложения могут открываться с разных доменов
    app.enableCors({
      origin: true, // Разрешаем все origin для Telegram WebApp
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });
    console.log('CORS enabled');

    const port = parseInt(process.env.PORT || '3000', 10);
    const host = process.env.HOST || '0.0.0.0'; // Слушаем на всех интерфейсах

    console.log(`\n=== INITIALIZING MODULES ===`);
    console.log('Waiting for all modules to initialize (OnModuleInit)...');

    // Даем время модулям инициализироваться
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log('Modules initialization check complete');

    console.log(`\n=== STARTING HTTP SERVER ===`);
    console.log(`Host: ${host}`);
    console.log(`Port: ${port}`);
    console.log(`Attempting to listen on ${host}:${port}...`);
    console.log('Note: This should complete immediately if port is available');

    try {
      const listenStartTime = Date.now();

      // Добавляем таймаут для app.listen()
      const listenPromise = app.listen(port, host);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Listen timeout: Server failed to start within 10 seconds`));
        }, 10000);
      });

      await Promise.race([listenPromise, timeoutPromise]);

      const listenTime = Date.now() - listenStartTime;
      console.log(`\n✓ HTTP Server is listening (took ${listenTime}ms)`);

      // Проверяем, что сервер действительно слушает
      const server = app.getHttpServer();
      const address = server.address();
      console.log('Server address:', address);
    } catch (listenError) {
      console.error('\n✗ Failed to start HTTP server');
      console.error('Listen error:', listenError);
      console.error('Error message:', listenError?.message);
      console.error('Error code:', listenError?.code);
      console.error('Error syscall:', listenError?.syscall);

      // Проверяем, занят ли порт
      exec(`lsof -i :${port}`, (error, stdout) => {
        if (stdout) {
          console.error(`\n⚠ Port ${port} is already in use:`);
          console.error(stdout);
        }
      });

      throw listenError;
    }

    console.log('\n=== SERVER STARTED SUCCESSFULLY ===');
    console.log(`Application is running on: http://${host}:${port}`);
    console.log(`Local access: http://localhost:${port}`);
    console.log(`Health check: http://localhost:${port}/health`);
    console.log('\nServer is ready to accept connections!\n');
  } catch (error) {
    console.error('=== SERVER STARTUP ERROR ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    process.exit(1);
  }
}

bootstrap();
