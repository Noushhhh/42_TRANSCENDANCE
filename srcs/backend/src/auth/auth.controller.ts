import {
  BadRequestException, Controller, Post,
  Body, Res, Get, Req, Delete, UseFilters, NotFoundException, Logger, HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { Public } from '../decorators/public.decorators';
import { Response, Request, response } from 'express';
import { ExtractJwt } from '../decorators/extract-jwt.decorator';
import { DecodedPayload } from '../interfaces/decoded-payload.interface';
import { TwoFADataDto, TwoFaUserIdDto, UserIdDto } from '../users/dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards';

const browserError: string = "This browser session is already taken by someone," + " please open a new browser or incognito window";

@Controller('auth')
export class AuthController {

  private readonly logger = new Logger(AuthController.name);
  constructor(private authService: AuthService) { }

  @Get('token')
  async getToken(@Req() req: Request) {
    // Extract the access token from the request cookies
    const accessToken = req.cookies['token'];
    return { accessToken }
  }

  @Public()
  @Post('signup')
  async signup(@Body() dto: AuthDto, @Res() res: Response) {
    return await this.authService.signup(dto, res);
  }

  @Public()
  @Post('signin')
  async signin(@Body() dto: AuthDto, @Res() res: Response, @Req() req: Request) {
    console.log("passing in signin service");
    return await this.authService.signin(dto, res, req);
  }


  @UseGuards(JwtAuthGuard) // Ensure the user is authenticated
  @Get('checkTokenValidity')
  async checkTokenValidity(@Req() req: Request, @Res() res: Response) {
    return this.authService.checkTokenValidity(req, res);
  }

  @UseGuards(JwtAuthGuard) // Ensure the user is authenticated
  @Post('refreshToken')
  async refreshToken(@ExtractJwt() decodedPayload: DecodedPayload, @Res() res: Response): Promise<Response> {

    const result: any = await this.authService.signToken(decodedPayload.sub, decodedPayload.email, res);

    if (!result) {
      return res.status(HttpStatus.FORBIDDEN).json({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Not able to refresh token',
        error: 'FORBIDDEN'
      });
    }

    return res.status(result.statusCode).json({ valid: result.valid, message: result.message });
  }

  @Delete('signout')
  async signout(@ExtractJwt() decodedPayload: DecodedPayload | null, @Res() res: Response) {
    if (!decodedPayload) {
      console.error("error decoding payload with decorator\n");
      return;
    }
    return this.authService.signout(decodedPayload.sub, res);
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
    await this.authService.signToken42(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Post('enable2FA')
  async enable2FA(@ExtractJwt() decodedPayload: DecodedPayload, @Res() response: Response) {
    await this.authService.enable2FA(decodedPayload.sub, response);
  }

  @UseGuards(JwtAuthGuard)
  @Post('disable2FA')
  async disable2FA(@Req() req: Request, @Res() res: Response) {
    if (!req.user?.id) throw new NotFoundException("User not found");

    try {
      await this.authService.disable2FA(req.user.id);
      res.status(HttpStatus.OK).json({ statusCode: HttpStatus.OK });
    } catch (error) {
      res.status(HttpStatus.NOT_FOUND).json({ statusCode: HttpStatus.NOT_FOUND, message: "User not found", error: "Not Found" });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('validating2FA')
  async validating2FA(@ExtractJwt() decodedPayload: DecodedPayload, @Body() TwoFAData: TwoFADataDto, @Res() response: Response) {
    await this.authService.validateTwoFA(decodedPayload.sub, TwoFAData.token, response);
  }

  @Post('verifyTwoFACode')
  async verifyTwoFACode(@Body() data: TwoFaUserIdDto, @Res() response: Response) {
    const res = await this.authService.verifyTwoFACode(data.userId, data.token, response)
    res.status(HttpStatus.OK).json({ statusCode: HttpStatus.OK });
  }

  @UseGuards(JwtAuthGuard)
  @Get('is2FaActivated')
  async is2FaActivated(@ExtractJwt() decodedPayload: DecodedPayload, @Res() response: Response) {
    try {
      const res = await this.authService.is2FaEnabled(decodedPayload.sub);
      response.status(HttpStatus.OK).json({ statusCode: HttpStatus.OK, res: res });

    } catch (error) {
      this.logger.error(error);
    }
  }
}
