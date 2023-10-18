import {Controller, Get, UseGuards, Req} from '@nestjs/common'
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
        return req.user;
    }

    @Get('UserWithId')
    FindWithId(userId: number): Promise<User | undefined>{
        return this.UsersService.findUserWithId(userId);
    }
<<<<<<< HEAD

=======
    
>>>>>>> c82b51bc15794599261efcb8dd3e4d9311d6ddb6
    @Get('UserWithUsername')
    FindWithUsername(username: string): Promise<User | undefined>{
        return this.UsersService.findUserWithUsername(username);
    }
}
