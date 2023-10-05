import {Controller, Get, UseGuards, Req} from '@nestjs/common'
// import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
// import { LocalAuthGuard } from '../auth/guards/local-auth.guard';

// import { JwtAuthGuard } from '../auth/guards/jwt.auth-guard';
// import { request } from 'express';
import { UsersService } from './users.service';
// import { AuthService } from '../auth/auth.service';
// import { JwtStrategy } from '../strategy/jwt.strategy';

@Controller ('users')
export class UsersController 
{
    constructor(
        private config: ConfigService,
        // private authService: AuthService,
        private UsersService: UsersService
        // private prisma: PrismaService,
        ){};

        // @UseGuards(LocalAuthGuard)
        // @UseGuards(AuthGuard())
        // @UseGuards(JwtAuthGuard)
    // @UseGuards(AuthGuard('jwt'))
    @Get ('me')
    getMe(@Req() req: Request)
    {
        try {
            console.log('get me called');
            const jwtCookie = req.cookies['token'];
            const secret = this.config.get('JWT_SECRET');
            const user = jwt.verify(jwtCookie, secret);
            console.log ("USER in get me == ", user)
            return user;
        } catch (error){
            console.log(error);
        }
        // console.log("helloooOOOoooo");
        // console.log("req ====", req);
        // console.log("requesttttt ====", request.user);
        // return req.user;
        // return req;
    }

    // @UseGuards(JwtAuthGuard)
    @Get('UserWithId')
    FindWithId(userId: number): Promise<User | undefined>{
        return this.UsersService.findUserWithId(userId);
    }

    @Get('UserWithUsername')
    FindWithUsername(username: string): Promise<User | undefined>{
        return this.UsersService.findUserWithUsername(username);
    }

}
