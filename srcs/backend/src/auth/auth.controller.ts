import { Controller, Post, Body, Res, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { Public } from '../decorators/public.decorators';
import { Response, Request } from 'express'

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Public()
    @Post('signup')
    async signup(@Body() dto: AuthDto, @Res() res: Response) {
        return this.authService.signup(dto, res);
    }

    @Public()
    @Post('signin')
    async signin(@Body() dto: AuthDto, @Res() res: Response) {
        return this.authService.signin(dto, res);
    }

    @Get('checkTokenValidity')
    async checkTokenValidity(@Req() req: Request, @Res() res: Response) {
        console.log("passing by checkTokenValidity");
        return this.authService.checkTokenValidity(req, res);
    }

    @Get('signout')
    async signout(@Res() res: Response){
        return this.authService.signout(res);
    }

    // change name to 42-callback 
    @Get('token') 
    async handle42Callback(@Req() req: Request, @Res() res: Response) {
    try {
        const user = await this.authService.signToken42(req);
        
        if (user.username != user.login) {
        res.redirect('/home'); // Redirect if the user is successfully created or authenticated
        } 
        else if (user.username === user.login) {
            res.redirect('/complete_profile');
        }
        else {
        console.error("error creating user"),
        // Handle other cases if needed (e.g., "User already exists")
        res.redirect('/error'); // Redirect to an error page or handle accordingly
        }
    } catch (error) {
        console.error(error);
        // Handle errors here and redirect as needed
        res.redirect('/error2');
    }
}

}