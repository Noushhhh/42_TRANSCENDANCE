import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Create a new NestJS application instance
  const app = await NestFactory.create(AppModule);

  // Start the application and listen on port 3000
  await app.listen(3000);
}
bootstrap();