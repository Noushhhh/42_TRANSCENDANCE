import {Controller, Get, Req, UseGuards} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { JwtGuard } from '../auth/guard/';
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
            console.log('get me called');
            const jwtCookie = req.cookies['token'];
            const secret = this.config.get('JWT_SECRET');
            const user = jwt.verify(jwtCookie, secret);
            return user;
        } catch (error){
            console.log(error);
        }
    }
}