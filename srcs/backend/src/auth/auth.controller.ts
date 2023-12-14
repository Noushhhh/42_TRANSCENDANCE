import { AllExceptionsFilter } from './exception/all-exception.filter';
import {
  InternalServerErrorException, BadRequestException, Controller, Post,
  Body, Res, Get, Req, Delete, UseFilters, ForbiddenException, NotFoundException
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { Public } from '../decorators/public.decorators';
import { Response, Request } from 'express';
import { ExtractJwt } from '../decorators/extract-jwt.decorator';
import { DecodedPayload } from '../interfaces/decoded-payload.interface';
import { TwoFADataDto, TwoFaUserIdDto, UserIdDto } from '../users/dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards';

const browserError: string = "This browser session is already taken by someone," + " please open a new browser or incognito window";

@UseFilters(AllExceptionsFilter)
@Controller('auth')
export class AuthController {
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
  async refreshToken(@ExtractJwt() decodedPayload: DecodedPayload | null, @Res() res: Response): Promise<Response> {
    try {
      if (!decodedPayload) {
        throw new BadRequestException('Access token not found in cookies');
      }
      const result: any = await this.authService.signToken(decodedPayload.sub, decodedPayload.email, res);
      return res.status(result.statusCode).send({ valid: result.valid, message: result.message });
    } catch (error) {
      console.error();
      throw new Error(`Error in refreshToken controller: ${error}`);
    }
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
    try {
      // Call the authService to handle 42 authentication
      await this.authService.signToken42(req, res);
    } catch (error) {
      console.error(error);
      // // Handle errors here and redirect as needed
      // res.redirect('http://localhost:8081/error');
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('enable2FA')
  async enable2FA(@Req() req: Request) {
    if (!req.user?.id) throw new NotFoundException("User not found");

    try {
      const qrcodeUrl = await this.authService.enable2FA(req.user.id);
      return { qrcode: qrcodeUrl }
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('disable2FA')
  async disable2FA(@Req() req: Request) {
    if (!req.user?.id) throw new NotFoundException("User not found");

    try {
      await this.authService.disable2FA(req.user.id);
      return { res: true }
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('validating2FA')
  async validating2FA(@Req() req: Request, @Body() TwoFAData: TwoFADataDto) {
    if (!req.user?.id) throw new NotFoundException("User not found");
    try {
      const res = await this.authService.validateTwoFA(req.user.id, TwoFAData.token);
      return { res: res };
    } catch (error) {
      throw error;
    }
  }

  @Post('verifyTwoFACode')
  async verifyTwoFACode(@Body() data: TwoFaUserIdDto, @Res() response: Response) {
    try {
      const res = await this.authService.verifyTwoFACode(data.userId, data.token, response)
      return { res: res };
    } catch (error) {
      throw error
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('is2FaActivated')
  async is2FaActivated(@Req() req: Request) {
    if (!req.user?.id) throw new NotFoundException("User not found");

    try {
      const is2FaEnabled = await this.authService.is2FaEnabled(req.user.id);
      return { res: is2FaEnabled };
    } catch (error) {
      throw error;
    }
  }
}
