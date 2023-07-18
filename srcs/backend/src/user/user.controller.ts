import {Controller, Get} from '@nestjs/common'

@Controller ('users')
export class UserController 
{
    // constructor (private authService: User)
    @Get ('me')
    getMe() 
    {
        return 'user info' ;
    }
}