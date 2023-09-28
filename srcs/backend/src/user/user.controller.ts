import {Controller, Get, Req, Query , NotFoundException} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { JwtGuard } from '../auth/guard/';
import { PrismaService } from '../prisma/prisma.service';
// import { JwtStrategy } from '../strategy/jwt.strategy';

@Controller ('users')
export class UserController {
    constructor(
        // private userController: UserController,
        private config: ConfigService,
        private prisma: PrismaService,
    ) { }

    // @UseGuards(JwtGuard)
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

    @Get('user_w_username')
    async getUserWUsername(@Query('username') username: string) {
      try {
        // Use Prisma service to find the user by username
        const user = await this.prisma.user.findUnique({
          where: { username },
        });
  
        if (!user) {
          throw new NotFoundException('User not found');
        }
        return user;
      } catch (error) {
        console.error(error);
        throw error; // Handle errors appropriately (e.g., return an error response)
      }
    }
}