import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  // Create a new NestJS application instance
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // check if whitelist needed or only restrain fields to login and password
  }));

  const corsOptions: CorsOptions = {
    // changed to 8081 to be able to fetch the api. was 8080 before
    origin: 'http://localhost:8081',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Access-Control-Request-Method', 'Access-Control-Request-Headers'],
    optionsSuccessStatus: 200,
    credentials: true,
  };
  // Activez CORS pour toutes les routes de l'application
  app.enableCors(corsOptions);
  app.use(cookieParser());
  app.setGlobalPrefix('api'); // set global route prefix
  // Start the application and listen on port 4000
  await app.listen(4000);
}
bootstrap();
