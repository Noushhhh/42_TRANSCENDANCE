import {Controller, Get, Req, UseGuards} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
// import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { UsersService } from './users.service';
// import { JwtStrategy } from '../strategy/jwt.strategy';

@Controller ('users')
export class UsersController 
{
    constructor(
        private config: ConfigService,
        // private UsersService: UsersService,
        // private prisma: PrismaService,
        ){};
    @UseGuards(JwtAuthGuard)
    @Get ('me')
    getMe(@Req() req: Request)
    {
        try {
            console.log('get me called');
            const jwtCookie = req.cookies['token'];
            const secret = this.config.get('JWT_SECRET');
            const user = jwt.verify(jwtCookie, secret);
            return user;
        } catch (error){
            console.log(error);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('UserWithId')
    getUserWithId(userId: number): Promise<User | undefined>{
        return this.getUserWithId(userId);
    }

    
}
