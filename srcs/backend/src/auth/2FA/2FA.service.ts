import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';
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
          issuer: 'ft_transcendance:${userId}', 
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

      async generateQrCode(userId: number): Promise<string> {
        try {
            const user: User | null = await this.prisma.user.findUnique({
                where: {
                  id: userId,
                },
            });
            if (!user) {
                throw new NotFoundException('User not found');
            }
            if (!user.twoFAUrl) {
                throw new NotFoundException('Otp URL not found');
            }
            return user.twoFAUrl;
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('Failed to return QR code.');
        }
    }
}
