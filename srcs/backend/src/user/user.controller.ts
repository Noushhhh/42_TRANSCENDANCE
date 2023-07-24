import {Controller, Get, Req, UseGuards} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
// import { JwtGuard } from '../guard/jwt.guard';
// import { JwtStrategy } from '../strategy/jwt.strategy';



@Controller ('users')
export class UserController 
{
    // constructor (private UserService: User)
    @UseGuards(AuthGuard('jwt'))
    @Get ('me')
    getMe(@Req() req: Request) 
    {
        return req.user;
    }
}