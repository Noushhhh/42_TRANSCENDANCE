import { Controller, Get, Param, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { TwoFaService } from './2FA.service';

@Controller('2fa')
export class TwoFaController {
  constructor(private readonly twoFaService: TwoFaService) {}

  @Get('generate-secret/:userId')
  async generateSecret(@Param('userId') userId: number) {
    try {
      const { secret, otpauthUrl } = this.twoFaService.generateTwoFASecret(userId);
      return { secret, otpauthUrl };
    } catch (error) {
      if (error === 'User not found') {
        throw new HttpException(error, HttpStatus.NOT_FOUND);
      } else if (error instanceof Error) {
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        throw new HttpException('An unexpected error occurred.', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Post('verify-code/:userId')
  async verifyCode(
    @Param('userId') userId: number,
    @Body() body: { code: string }
  ) {
    try {
      const isValid = await this.twoFaService.verifyTwoFACode(userId, body.code);
      if (!isValid) {
        throw new HttpException('Invalid code provided.', HttpStatus.BAD_REQUEST);
      }
      return { isValid };
    } catch (error) {
      if (error === 'User not found') {
        throw new HttpException(error, HttpStatus.NOT_FOUND);
      } else if (error instanceof Error) {
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        throw new HttpException('An unexpected error occurred.', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Get('generate-qr-code/:userId')
  async generateQrCode(@Param('userId') userId: number) {
    try {
      const otpauthUrl = this.twoFaService.generateOtpauthUrl(userId);
      const qrCodeDataURL = await this.twoFaService.generateQrCode(otpauthUrl);
      return { qrCodeDataURL };
    } catch (error) {
      if (error === 'User not found') {
        throw new HttpException(error, HttpStatus.NOT_FOUND);
      } else if (error instanceof Error) {
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        throw new HttpException('An unexpected error occurred.', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
