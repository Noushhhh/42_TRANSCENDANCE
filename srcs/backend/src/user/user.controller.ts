// import {Controller, Get, Req, UseGuards, UnauthorizedException} from '@nestjs/common'
// // import { AuthGuard } from '@nestjs/passport';
// import { Request } from 'express';
// import { User } from '@prisma/client';
// // import { ConfigService } from '@nestjs/config';
// // import * as jwt from 'jsonwebtoken';
// import { JwtGuard } from '../auth/guard/';
// import { JwtStrategy } from '../strategy/jwt.strategy';

// @Controller ('users')
// export class UserController 
// {
//     // constructor(private config: ConfigService) {};
//     // constructor (private UserService: User)
//     @UseGuards(JwtGuard)
//     @Get ('me')
//     getMe(@Req() req: Request): User{
//         // return this.getMe(req);
//         // async getMe(@Req() req: Request): Promise<User> {
//             const jwtCookie = req.cookies['token'];
        
//             if (!jwtCookie) {
//               throw new UnauthorizedException('JWT token missing');
//             }
        
//             // Verify the JWT and get user information
//             const user = await this.jwtAuthService.verifyToken(jwtCookie);
//             if (!user) {
//               throw new UnauthorizedException('Invalid JWT token');
//             }
        
//             return user;
//           }
//     }
// }

// user.controller.ts

import { Controller, Get, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { User } from '@prisma/client';
import { UserService } from './user.service';
import { JwtAuthService } from '../strategies/jwt.strategy'; // Import your JWT service
// import { JwtGuard } from '../guards/jwt.guard';


@Controller('users')
export class UserController {
    constructor(
        // private readonly jwtAuthService: JwtAuthService,
        private userService: UserService) {}
    // @UseGuards(JwtGuard)
    @Get('me')
    async getMe(@Req() req: Request): Promise<User> {
        const jwtCookie = req.cookies['token'];

        if (!jwtCookie) {
        throw new UnauthorizedException('JWT token missing');
        }

        // Verify the JWT and get user information
        const user = await this.jwtAuthService.verifyToken(jwtCookie);
        if (!user) {
        throw new UnauthorizedException('Invalid JWT token');
        }

        return user;
    }
}
