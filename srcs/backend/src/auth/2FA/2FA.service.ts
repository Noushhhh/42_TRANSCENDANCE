import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import * as speakeasy from 'speakeasy';
// import * as qrcode from 'qrcode';

@Injectable()
export class TwoFaService {
    constructor(
        private prisma: PrismaService ) {}

    generateTwoFASecret(userId: number): { secret: string; otpauthUrl: string } {
        const secret = speakeasy.generateSecret({ length: 20 }); // Generate a 20-character secret
        const otpauthUrl = speakeasy.otpauthURL({
          secret: secret.base32,
          label: `ft_transcendance:${userId}`, 
          issuer: 'ft_transcendance', 
        });
        return { secret: secret.base32, otpauthUrl };
      }

      async verifyTwoFACode(userId: number, code: string): Promise<boolean> {
        const user: User | null = await this.prisma.user.findUnique({
          where: {
            id: userId,
          },
        });
      
        if (!user) {
          throw new Error('User not found');
        }
  
        const verified = speakeasy.totp.verify({
          secret: user.twoFASecret || '',
          encoding: 'base32',
          token: code,
        });
      
        return verified;
      }

    // async generateQrCode(data: string): Promise<string> {
    //     try {
    //         const qrCodeDataURL = await qrcode.toDataURL(data);
    //         return qrCodeDataURL;
    //     } catch (error) {
    //         throw new Error('Failed to generate QR code.');
    //     }
    // }
}

//   /**
//    * Check if entered code for google authentificator is valid
//    * @param token 
//    * @param secret 
//    * @returns 
//    */
//   async is2faCodeValid(token: string, secret:string) {
//     const isCodeValid = speakeasy.totp.verify(
//     { 
//       token,
//       secret,
//     });
//     if (!isCodeValid) {
//       throw new UnauthorizedException('Wrong authentication code');
//     }
//     return (true);
//   }

// }