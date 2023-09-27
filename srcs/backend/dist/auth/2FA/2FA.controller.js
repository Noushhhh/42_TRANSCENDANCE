"use strict";
// import * as speakeasy from 'speakeasy';
// import { Controller } from "@nestjs/common";
// @Controller('TwoFA')
// export class TwoFAController {
//     @Post ('Enable2FA')
//     async enable2FA()
// }
//     async generateTwoFASecret(userId: number): { secret: string; otpauthUrl: string } {
//         const secret = speakeasy.generateSecret({ length: 20 }); // Generate a 20-character secret
//         const otpauthUrl = speakeasy.otpauthURL({
//         secret: secret.base32,
//         label: `MyApp:${userId}`, // Customize the label as needed
//         issuer: 'MyApp', // Customize the issuer as needed
//         });
//         return { secret: secret.base32, otpauthUrl };
//     }
