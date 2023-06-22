import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap() {
  // Create a new NestJS application instance
  const app = await NestFactory.create(AppModule);

  const corsOptions: CorsOptions = {
    origin: true, // Allow requests from any origin
    // origin: 'http://localhost:3000',
    optionsSuccessStatus: 200, // Ajoutez ce code d'état pour les réponses pré-vol (preflight)
    credentials: true, // Allow sending cookies from the frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  };

  // Activez CORS pour toutes les routes de l'application
  app.enableCors(corsOptions);


  app.setGlobalPrefix('api'); // set global route prefix
  // Start the application and listen on port 4000
  await app.listen(4000);
}
bootstrap();