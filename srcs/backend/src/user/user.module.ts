import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { ConfigService } from '@nestjs/config';
import { JwtAuthService } from '../jwt/jwt.service'; // Import JwtAuthService


@Module ({
    providers: [JwtAuthService, ConfigService],
    controllers: [UserController],
    // providers:[ConfigService]
 })
export class UserModule {}