import { Controller, Post, Body, Res, Get, Req, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { Public } from '../decorators/public.decorators';
import { Response, Request } from 'express'
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Public()
    @Post('signup')
    async signup(@Body() dto: AuthDto, @Res() res: Response) {
        return this.authService.signup(dto, res);
    }

    // @HttpCode(HttpStatus.OK)
    @Public()
    @UseGuards(LocalAuthGuard)
    @Post('signin') // delete async, has to signin and cannot do anything else
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
 
    @Public()
    @Get('42Url')
    async get42Url() {
        const url = "https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-c601adb4ff1b1cb2a3beeecf17b0f6fdda957b3fda7f427d752162777499d169&redirect_uri=http%3A%2F%2Flocalhost%3A4000%2Fapi%2Fauth%2Fcallback42&response_type=code";
        // const url = "https://api.intra.42.fr/oauth/authorize?client_id=" + process.env.UID_42 + "&redirect_uri=" + process.env.REDIRECT_URI + "response_type=code";
        return (url);
    }

    // @Public()
    @Get('callback42') 
    async handle42Callback(@Req() req: Request, @Res() res: Response) {
        console.log("test");
        try {   
            // Call the authService to handle 42 authentication
            await this.authService.signToken42(req, res);
        } catch (error) {
            console.error(error);
            // Handle errors here and redirect as needed
            res.redirect('/error2');
        }
    }

    @Post('enable2FA') 
    async enable2FA () {

    }

}
