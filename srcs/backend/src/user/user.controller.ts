import {Controller, Get, Req, Query , NotFoundException} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
// import { JwtStrategy } from '../strategy/jwt.strategy';

@Controller ('users')
export class UserController 
{
    constructor(private config: ConfigService) {};
    // constructor (private UserService: User)
    // @UseGuards(JwtGuard)
    @Get ('me')
    getMe(@Req() req: Request)
    {
        try {
            const jwtCookie = req.cookies['token'];
            const secret = this.config.get('JWT_SECRET');
            const user = jwt.verify(jwtCookie, secret);
            return user;
        } catch (error){
            console.log(error);
        }
    }
}