import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { UnauthorizedException, ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import * as path from 'path';
import cookieParser from 'cookie-parser';
import cron from 'node-cron';
import { SessionService } from './auth/session.service';
import { BrowserCheckMiddleware } from './tools/requestsMiddleware'


// The bootstrap function is the entry point of the application
export default async function App() {
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

  const allowedOrigins = [
    'http://localhost:8080',
    // Add a pattern to allow any IP from the local network
    /^http:\/\/10\.20\.15\.\d{1,3}:8081$/,
    /^http:\/\/10\.20\.[0-7]\.\d{1,3}:8081$/, // Pattern to match IPs from 10.20.0.0 to 10.20.7.255
    'http://localhost:8080',
    // ... other origins ...
  ];

  // Configure CORS (Cross-Origin Resource Sharing) options
  const corsOptions: CorsOptions = {

    origin: (origin, callback) => {
      const isAllowed = !origin || allowedOrigins.some((allowedOrigin) => {
        if (typeof allowedOrigin === 'string') {
          return origin === allowedOrigin;
        } 
        else if (allowedOrigin instanceof RegExp) {
          return allowedOrigin.test(origin);
        }
        return false;
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new UnauthorizedException('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: [
      'Content-Type',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers',
      'x-user-id',
      'X-Search-Header'
    ],
    optionsSuccessStatus: 200,
    credentials: true,
  };

  // Enable CORS for all routes in the application
  app.enableCors(corsOptions);

  // Use express.json middleware to parse incoming JSON payloads
  // set a large limit to avoid server crash for large body request
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));

  // Use cookie-parser middleware to parse incoming cookies
  app.use(cookieParser());

  // Set a global route prefix for the application
  app.setGlobalPrefix('api');
  // Serve static files from the 'uploads' folder
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  //make sure all the Expired sessions are deleted from the data base, this job will be executed every minute
  cron.schedule('* * * * *', async () => {
    await sessionService.clearExpiredSessions();
  });

  const BC = new BrowserCheckMiddleware;
  app.use('/api', BC.use);

  // Start the application and listen on port 4000
  await app.listen(4000);
}

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Call the bootstrap function to start the application
App();
