// Import necessary modules and classes
import { AllExceptionsFilter } from './auth/exception/all-exception.filter';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import * as path from 'path';
import cookieParser from 'cookie-parser';
import cron from 'node-cron';
import { SessionService } from './auth/session.service';


// The bootstrap function is the entry point of the application
async function bootstrap() {
  // Create a new NestJS application instance
  const app = await NestFactory.create(AppModule);

  const sessionService = app.get(SessionService);

  // Use the ValidationPipe to validate incoming requests
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Configure CORS (Cross-Origin Resource Sharing) options
  const corsOptions: CorsOptions = {
    origin: 'http://localhost:8081',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: [
      'Content-Type',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers',
      'x-user-id',
    ],
    optionsSuccessStatus: 200,
    credentials: true,
  };

  // Enable CORS for all routes in the application
  app.enableCors(corsOptions);

  // Use express.json middleware to parse incoming JSON payloads
  app.use(express.json());

  // Use cookie-parser middleware to parse incoming cookies
  app.use(cookieParser());

  // Set a global route prefix for the application
  app.setGlobalPrefix('api');

  // Use the AllExceptionsFilter to handle exceptions globally
  app.useGlobalFilters(app.get(AllExceptionsFilter));

  // Serve static files from the 'uploads' folder
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  //make sure all the Expired sessions are deleted from the data base, this job will be executed every minute
  cron.schedule('* * * * *', async () => {
    await sessionService.clearExpiredSessions();
    // console.log("Cron job executed every minute");
  });

  // Start the application and listen on port 4000
  await app.listen(4000);
}

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Call the bootstrap function to start the application
bootstrap();
