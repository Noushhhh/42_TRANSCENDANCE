import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // Create a new NestJS application instance
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
  }));
  const corsOptions: CorsOptions = {
    origin: 'http://localhost:8080',
    optionsSuccessStatus: 200, // Ajoutez ce code d'état pour les réponses pré-vol (preflight)
  };
  app.setGlobalPrefix("api");
  // Activez CORS pour toutes les routes de l'application
  app.enableCors(corsOptions);

  // app.setGlobalPrefix('api'); // set global route prefix
  // Start the application and listen on port 4000
  await app.listen(4000);
}
bootstrap();