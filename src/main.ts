/**
 * Application Entry Point
 * 
 * This is the main entry point for the NestJS application.
 * It bootstraps the application, configures global pipes,
 * and starts the HTTP server.
 * 
 * Features configured:
 * - Global ValidationPipe for request body validation
 * - Server listening on port 3000
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  // Create NestJS application instance
  const app = await NestFactory.create(AppModule);
  
  // Configure global ValidationPipe
  // - whitelist: strips properties not defined in DTOs
  // - transform: automatically transforms payloads to DTO instances
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  
  // Start the server on port 3000
  await app.listen(3000);
  
  // Log startup message
  console.log('Application is running on: http://localhost:3000');
}

// Bootstrap the application
bootstrap();
