import{ Controller, Post, Body, Req, ParseIntPipe, Get } from '@nestjs/common';
// import { Request } from 'express';
import { AuthService } from  './auth.service';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
    constructor (private authService: AuthService) {}
    
   // POST /auth/signup
    @Post('signup')
    signup(@Body() dto: AuthDto) {
        return this.authService.signup(dto);
    }

    // POST /auth/signin
    @Post('signin')
    signin(@Body() dto: AuthDto) {
        return this.authService.signin(dto);
    }

    // @Post('test')
    // test() {
    //     return 'hello test';
    // }

    // @Get('token')

    @Get('token')
    token(@Req() req: any)
    {
        console.log(req.query['code']);
    }
}