import{ Controller, Post, Body } from '@nestjs/common';
// import { Request } from 'express';
import { AuthService } from  './auth.service';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
    constructor (private authService: AuthService) {}
    
   // POST /auth/signup
    @Post('signup')
    signup(@Body() dto: AuthDto) {
        console.log({
            dto,

        });
        return this.authService.signup();
    }

    //POST /auth/signin
    @Post('signin')
    signin() {
        return this.authService.signin();
    }
}