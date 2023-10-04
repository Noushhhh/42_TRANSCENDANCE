import {Controller, Get, UseGuards, Request} from '@nestjs/common'
// import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
// import { AuthGuard } from '@nestjs/passport';
// import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
// import { LocalAuthGuard } from '../auth/guards/local-auth.guard';

import { JwtAuthGuard } from '../auth/guards/jwt.auth-guard';
import { request } from 'express';
// import { UsersService } from './users.service';
// import { AuthService } from '../auth/auth.service';
// import { JwtStrategy } from '../strategy/jwt.strategy';

@Controller ('users')
export class UsersController 
{
    constructor(
        private config: ConfigService,
        // private authService: AuthService,
        // private UsersService: UsersService,
        // private prisma: PrismaService,
        ){};

    // @UseGuards(AuthGuard('jwt'))
    // @UseGuards(LocalAuthGuard)
    // @UseGuards(AuthGuard)
    @UseGuards(JwtAuthGuard)
    @Get ('me')
    getMe(@Request() req: Request)
    {
        // try {
        //     console.log('get me called');
        //     const jwtCookie = req.cookies['token'];
        //     const secret = this.config.get('JWT_SECRET');
        //     const user = jwt.verify(jwtCookie, secret);
        //     return user;
        // } catch (error){
        //     console.log(error);
        // }
        console.log("helloooOOOoooo");
        console.log("req ====", req);
        console.log("requesttttt ====", request);

        return request.user;
    }

    // @UseGuards(JwtAuthGuard)
    @Get('UserWithId')
    getUserWithId(userId: number): Promise<User | undefined>{
        return this.getUserWithId(userId);
    }
}
