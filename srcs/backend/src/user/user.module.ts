import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { ConfigService } from '@nestjs/config';

@Module ({
    controllers: [UserController],
    providers:[ConfigService]
 })
export class UserModule {}