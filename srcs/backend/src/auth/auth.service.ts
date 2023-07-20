import { ForbiddenException, Injectable } from '@nestjs/common';
// import { User, Bookmark } from  '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { AuthDto } from './dto';
import * as argon from 'argon2';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) {}

    async signup(dto: AuthDto) 
    {
        // generate password hash
        const hashPassword = await argon.hash(dto.password);
        // save user in db
        try
        {
            const user = await this.prisma.user.create({
                data: {
                    username: dto.username,
                    hashPassword,
                },
            select:
            {
                username : true, // return only username and not hash pwd
            }
            });
            // return saved user
            return user;
        }
        catch (error: unknown) 
        {
            // handle parsing errors
            if (
                error instanceof PrismaClientKnownRequestError &&
                error.code === 'P2002' // try to create new record with unique field
            ) 
            {
                // throw new Error('Username already in use');
                throw new ForbiddenException("Username already in use")
            }
    
            // handle other errors
            throw error;
        }
    }

    async signin(dto: AuthDto) 
    {
        // find user with username
        const user = await this.prisma.user.findUnique({
            where: {
                username: dto.username,
            }
        });
        // if user not found throw exception
        if (!user)
            throw new ForbiddenException('Username not found',);
        
        // compare password
        const passwordMatch = await argon.verify(user.hashPassword, dto.password,);
        
        // if password wrong throw exception
        if (!passwordMatch)
            throw new ForbiddenException('Incorrect password',);

        // send back the user
        // delete user.hashPassword
            return user ;

    }
}
