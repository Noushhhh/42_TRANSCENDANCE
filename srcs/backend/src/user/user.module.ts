import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ConfigService } from '@nestjs/config';

@Module ({
    controllers: [UserController],
    providers:[UserService, ConfigService]
 })
export class UserModule {}