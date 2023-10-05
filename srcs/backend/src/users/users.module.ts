import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
// import { JwtExtractionMiddleware } from '../strategies';
// import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../strategies/jwt.strategy';
// import { AuthService } from '../auth/auth.service';


@Module ({
    controllers: [UsersController],
    providers: [
        // JwtExtractionMiddleware,
        // AuthService,
        UsersService, 
        // ConfigService, 
        JwtStrategy
    ],
    exports: [UsersService]
    // providers:[ConfigService]
 })
export class UsersModule {}