import { BadRequestException, Catch, ExceptionFilter, HttpException, ArgumentsHost, InternalServerErrorException } from '@nestjs/common';
import { Controller, Post, Body, Res, Get, Req, HttpCode, HttpStatus, UseGuards, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { Public } from '../decorators/public.decorators';
import { Response, Request } from 'express';
import { ExtractJwt } from '../decorators/extract-jwt.decorator';
import { DecodedPayload } from '../interfaces/decoded-payload.interface';

const browserError: string = "This browser session is already taken by someone," + " please open a new browser or incognito window";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('token')
  async getToken(@Req() req: Request) {
    const accessToken = req.cookies['token'];
    return { accessToken };
  }

  @Public()
  @Post('signup')
  async signup(@Body() dto: AuthDto, @Res() res: Response) {
    try {
      const result = await this.authService.signup(dto, res);
      res.status(result.statusCode).send({ valid: result.valid, message: result.message });
    } catch (error) {
      res.status(500).send({ valid: false, message: error });
    }
  }

  @Post('signin')
  async signin(@Body() dto: AuthDto, @Res() res: Response, @Req() req: Request) {
    try {
      const result: any = await this.authService.signin(dto, res);
      res.status(200).send({ valid: result.valid, message: result.message });
    } catch (error) {
      console.log(error);
      res.status(500).send({ valid: false, message: error });
    }
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
    const url = "https://api.intra.42.fr/oauth/authorize?client_id=" + process.env.UID_42 + "&redirect_uri=" + process.env.REDIRECT_URI + "response_type=code";
    return (url);
  }

  @Get('callback42')
  async handle42Callback(@Req() req: Request, @Res() res: Response) {
    console.log("test");
    try {
      await this.authService.signToken42(req, res);
    } catch (error) {
      console.error(error);
      res.redirect('/error2');
    }
  }

  @Post('enable2FA')
  async enable2FA() {
  }
}