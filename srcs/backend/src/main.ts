// Import necessary modules and dependencies
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';

// Define the bootstrap function
async function bootstrap() {
  // Create a NestJS application instance with the AppModule and NestExpressApplication type
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Use the ValidationPipe globally with the whitelist option enabled
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
  }));

  // Define CORS options
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

  // Use the cookie-parser middleware
  app.use(cookieParser());

  // Set the global prefix for the API routes
  app.setGlobalPrefix('api');

  // Serve static files from the 'uploads' folder with the '/uploads' prefix
  app.useStaticAssets('uploads', { prefix: '/uploads' });

  // Start the application on port 4000
  await app.listen(4000);
}

// Call the bootstrap function to start the application
bootstrap();
