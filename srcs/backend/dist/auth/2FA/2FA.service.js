"use strict";
// import { Injectable } from '@nestjs/common';
// import { speakeasy } from 'speakeasy';
// @Injectable()
// export class TwoFaService {
//     generateTwoFASecret(userId: number): { secret: string; otpauthUrl: string } {
//         const secret = speakeasy.generateSecret({ length: 20 }); // Generate a 20-character secret
//         const otpauthUrl = speakeasy.otpauthURL({
//           secret: secret.base32,
//           label: `MyApp:${userId}`, // Customize the label as needed
//           issuer: 'MyApp', // Customize the issuer as needed
//         });
//         return { secret: secret.base32, otpauthUrl };
//       }
// }
//   async generateQRcode(id: string) {
//     const secretInfos = speakeasy.generateSecret( {
//       name: "ft_Transcendence"
//     });
//     await this.userService.set2faSecret(secretInfos.ascii, id);
//     const QRcode = await qrcode.toDataURL(secretInfos.otpauth_url);
//     await this.userService.setQrCode(QRcode, id);
//     return (QRcode);
//   }
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
