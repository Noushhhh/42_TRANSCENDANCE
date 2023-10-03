import { Controller, Get} from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AppController {

    constructor(private readonly appService: AppService) { }

    @Get()
    getHello(): string {
      // Call the `getHello` method of the `AppService`
      return this.appService.getHello();
    }
    @Get('status') // Handles GET requests to the root URL
    getStatus(): { status: string } {
      return { status: 'im here bro' };
    }
}