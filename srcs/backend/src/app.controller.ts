import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller() // Declare this class as a controller
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get() // Handles GET requests to the root URL
  getHello(): string {
    // Call the `getHello` method of the `AppService`
    return this.appService.getHello();
  }
}