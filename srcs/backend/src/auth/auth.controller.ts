import { Controller, Post, Body, Res, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
// import { AuthGuard } from '@nestjs/passport';
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
    // @Public()
    // @Get('42Url')
    // async get42Url() {
    //     // const callback_url = encodeURIComponent(process.env.CALLBACK_URL_42);
    //     const url = "https://api.intra.42.fr/oauth/authorize?client_id=" + process.env.UID_42 + "&redirect_uri=" + "http%3A%2F%2Flocalhost%3A4000%2Fapi%2Fauth%2Ftoken&response_type=code";
    //     return (url);
    // }

    @Get('token') 
    async handle42Callback(@Req() req: Request, @Res() res: Response) {
        try {
            const user = await this.authService.signToken42(req, res);    
            // implement revesre proxy
            res.redirect('http://localhost:8081/home');
            // res.redirect('');
        } catch (error) {
            console.error(error);
            // Handle errors here and redirect as needed
            res.redirect('/error2');
        }
    }

    // @Post('enable2FA')
    // async enable2FA()

}