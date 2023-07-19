import {Controller, Get} from '@nestjs/common'

@Controller ('users')
export class UserController 
{
    // constructor (private UserService: User)
    @Get ('me')
    getMe() 
    {
        console.log('coucou')
        return 'user info' ;
    }
}