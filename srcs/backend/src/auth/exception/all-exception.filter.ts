import { Logger, Catch, ArgumentsHost, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { ExceptionFilter } from '@nestjs/common/interfaces/exceptions';
import { PrismaService } from '../../prisma/prisma.service';

// The AllExceptionsFilter class is a global exception filter in NestJS.
// It catches all unhandled exceptions across the application.
// This is useful for handling unexpected errors and providing a consistent response structure for all errors.
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(@Inject(PrismaService) private prisma: PrismaService) { }

  // The catch method is called when an exception is not caught by any other exception filter.
  // It takes the exception and the host (which represents the context in which the exception was thrown) as arguments.
  catch(exception: unknown, host: ArgumentsHost) {
    // Get the HTTP context from the ArgumentsHost
    const ctx = host.switchToHttp();
    // Get the response object from the HTTP context
    const response = ctx.getResponse();
    // Get the request object from the HTTP context
    const request = ctx.getRequest();
    // Determine the status code for the response based on the exception
    // If the exception is an instance of HttpException, we use its status. Otherwise, we default to internal server error.
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    // Get the message from the exception if it's an instance of HttpException
    let message;
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      // Check if the response is an object and has a message property
      if (typeof response === 'object' && response.hasOwnProperty('message')) {
        message = (response as any).message;
      } else {
        message = response; // If not, use the entire response
      }
    } else {
      message = 'Internal server error';
    }

    // Check if exception is an instance of Error before logging
    if (exception instanceof Error) {
      this.logger.error(`Exception occurred: ${exception.toString()}`, exception.stack);
    } else {
      this.logger.error(`Exception occurred: ${exception}`);
    }

    // If the backend crashes, set loggedIn to false for all users
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.prisma.user.updateMany({
        data: { loggedIn: false },
      });
    }

    // Send the response with the appropriate status code and a JSON object containing the error details
    // This provides a consistent structure for error responses.
    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

// Example usage:
// In your main.ts file, you would use this class as a global filter like so:

// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { AllExceptionsFilter } from './all-exceptions.filter';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   app.useGlobalFilters(new AllExceptionsFilter());
//   await app.listen(3000);
// }
// bootstrap();
