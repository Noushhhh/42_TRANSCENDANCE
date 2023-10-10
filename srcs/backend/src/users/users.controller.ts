import {Controller, Get, UseGuards, Req, Post, NotFoundException} from '@nestjs/common'
// import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt.auth-guard';
import { UsersService } from './users.service';

@Controller ('users')
export class UsersController 
{
    constructor(
        private UsersService: UsersService
        ){};

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getMe(@Req() req: Request) {
        console.log(req.user);
        // return req.user?.id;
        return req.user;
    }

    @UseGuards(JwtAuthGuard)
    @Get('UserWithId')
    FindWithId(userId: number): Promise<User | undefined>{
        return this.UsersService.findUserWithId(userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('UserWithUsername')
    FindWithUsername(username: string): Promise<User | undefined>{
        return this.UsersService.findUserWithUsername(username);
    }

    @UseGuards(JwtAuthGuard)
    @Post('enable2FA') 
    async enable2FA (@Req() req: Request) {
    const userInfo: any = req.user;
    const updatedUser = await this.UsersService.enable2FAForUser(userInfo.id);
    if (!updatedUser) {
        throw new NotFoundException(`User with ID ${userInfo.id} not found`);
    }
    return { message: '2FA enabled successfully' }; //, twoFAUrl
    }
}
