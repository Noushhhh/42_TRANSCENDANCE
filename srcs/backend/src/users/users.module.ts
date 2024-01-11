import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { UsersGateway } from './users.gateway';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';

@Module ({
    controllers: [UsersController],
    providers: [
        UsersService, 
        JwtStrategy,
        UsersGateway,
        AuthService,
        JwtService,
    ],
    exports: [UsersService]
 })
export class UsersModule {}