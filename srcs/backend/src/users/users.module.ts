import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
// import { ConfigService } from '@nestjs/config';

@Module ({
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService]
    // providers:[ConfigService]
 })
export class UsersModule {}