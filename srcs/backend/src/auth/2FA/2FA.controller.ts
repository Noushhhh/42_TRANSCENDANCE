import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { TwoFaService } from './2FA.service';

@Controller('2fa')
export class TwoFaController {
  constructor(private readonly twoFaService: TwoFaService) {}

  @Get('generate-secret/:userId')
  async generateSecret(@Param('userId') userId: number) {
    const { secret, otpauthUrl } = this.twoFaService.generateTwoFASecret(userId);
    return { secret, otpauthUrl };
  }

  @Post('verify-code/:userId')
  async verifyCode(
    @Param('userId') userId: number,
    @Body() body: { code: string }
  ) {
    const isValid = await this.twoFaService.verifyTwoFACode(userId, body.code);
    return { isValid };
  }

//   @Get('generate-qr-code/:userId')
//   async generateQrCode(@Param('userId') userId: number) {
//     // const otpauthUrl = this.twoFaService.generateOtpauthUrl(userId);
//     const qrCodeDataURL = await this.twoFaService.generateQrCode(otpauthUrl);
//     return { qrCodeDataURL };
//   }
}


//     async generateTwoFASecret(userId: number): { secret: string; otpauthUrl: string } {
//         const secret = speakeasy.generateSecret({ length: 20 }); // Generate a 20-character secret
//         const otpauthUrl = speakeasy.otpauthURL({
//         secret: secret.base32,
//         label: `MyApp:${userId}`, // Customize the label as needed
//         issuer: 'MyApp', // Customize the issuer as needed
//         });
    
//         return { secret: secret.base32, otpauthUrl };
//     }
  