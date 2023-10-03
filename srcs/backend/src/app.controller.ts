import { Controller, Get, Request, Post, UseGuards} from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth/auth.service';
import { LocalAuthGuard } from './auth/guards/local-auth.guard';

@Controller()
export class AppController {

    constructor(
      private readonly appService: AppService,
      private authService: AuthService,
      ) { }

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