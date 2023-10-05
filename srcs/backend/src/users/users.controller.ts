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
        return req.user;
    }

    @Get('UserWithId')
    FindWithId(userId: number): Promise<User | undefined>{
        return this.UsersService.findUserWithId(userId);
    }

    @Get('UserWithUsername')
    FindWithUsername(username: string): Promise<User | undefined>{
        return this.UsersService.findUserWithUsername(username);
    }

    // @UseGuards(JwtAuthGuard)
    @Post('enable2FA') 
    async enable2FA (@Req() req: Request)  {
        console.log("hellooo");
        const userInfo = req.user;
        console.log(userInfo);
        // Here, generate the 2FA secret and URL. For simplicity, I'll just make up values:
        // const twoFASecret = 'YOUR_GENERATED_2FA_SECRET';
        // const twoFAUrl = 'YOUR_GENERATED_2FA_URL';

        // Update the user's record with the 2FA information:
        // const updatedUser = await this.usersService.enableTwoFAForUser(user.id, twoFASecret, twoFAUrl);

        // if (!user) {
            // throw new NotFoundException(`User with ID ${user.username} not found`);
        // }
        // user.TwoFA == true;

        // return { message: '2FA enabled successfully', twoFAUrl };
    }
}
