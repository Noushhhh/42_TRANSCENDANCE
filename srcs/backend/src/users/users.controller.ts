import {Controller, Get, UseGuards, Req, Query} from '@nestjs/common'
// import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt.auth-guard';
import { UsersService } from './users.service';
import { UserIdDto } from './dto';

@Controller ('users')
export class UsersController 
{
    constructor(
        private UsersService: UsersService
        ){};

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getMe(@Req() req: Request) {
        return req.user;
    }

    @Get('UserWithId')
    FindWithId(userId: number): Promise<User>{
        return this.UsersService.findUserWithId(userId);
    }

    @Get('getUsernameWithId')
    getUsernameWithId(
        @Query() dto: UserIdDto): Promise<string>{
        return this.UsersService.getUsernameWithId(dto.userId);
    }
    
    @Get('UserWithUsername')
    FindWithUsername(username: string): Promise<User | undefined>{
        return this.UsersService.findUserWithUsername(username);
    }
}
