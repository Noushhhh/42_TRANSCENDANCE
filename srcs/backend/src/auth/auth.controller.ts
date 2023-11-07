import { AllExceptionsFilter } from './exception/all-exception.filter';
import {
  InternalServerErrorException, BadRequestException, Controller, Post,
  Body, Res, Get, Req, Delete, UseFilters, ForbiddenException
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { Public } from '../decorators/public.decorators';
import { Response, Request } from 'express';
import { ExtractJwt } from '../decorators/extract-jwt.decorator';
import { DecodedPayload } from '../interfaces/decoded-payload.interface';

const browserError: string = "This browser session is already taken by someone," + " please open a new browser or incognito window";


@UseFilters(AllExceptionsFilter)
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

    @Get('token')
    async getToken(@Req() req: Request) {
        // Extract the access token from the request cookies
        const accessToken = req.cookies['token'];
        return { accessToken}
    }

  @Public()
  @Post('signup')
  async signup(@Body() dto: AuthDto, @Res() res: Response) {
      return await this.authService.signup(dto, res);
  }

  @Post('signin')
  async signin(@Body() dto: AuthDto, @Res() res: Response, @Req() req: Request) {

    return await this.authService.signin(dto, res, req);
  }

  @Get('checkTokenValidity')
  async checkTokenValidity(@Req() req: Request, @Res() res: Response) {
    return this.authService.checkTokenValidity(req, res);
  }

  @Post('refreshToken')
  async refreshToken(@ExtractJwt() decodedPayload: DecodedPayload | null, @Res() res: Response): Promise<Response> {
    try {
      if (!decodedPayload) {
        throw new BadRequestException('Invalid token payload');
      }
      const result: any = await this.authService.signToken(decodedPayload.sub, decodedPayload.email, res);
      return res.status(result.statusCode).send({ valid: result.valid, message: result.message });
    } catch (error) {
      console.error('Error in refreshToken controller:', error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  @Delete('signout')
  async signout(@ExtractJwt() decodedPayload: DecodedPayload | null, @Res() res: Response) {
    if (!decodedPayload) {
      console.error("error decoding payload with decorator\n");
      return;
    }
    return this.authService.signout(decodedPayload, res);
  }

    @Public()
    @Get('42Url')
    async get42Url() {
        const url = "https://api.intra.42.fr/oauth/authorize?client_id=" + process.env.UID_42 + "&redirect_uri=" + process.env.REDIRECT_URI + "&response_type=code";
        return (url);
    }

    // @Public()
    @Get('callback42')
    async handle42Callback(@Req() req: Request, @Res() res: Response) {
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
  async enable2FA() {
  }
}