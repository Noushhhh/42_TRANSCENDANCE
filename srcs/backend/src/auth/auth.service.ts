import { Injectable } from '@nestjs/common';
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
        catch (error: unknown) {
            // handle parsing errors
            if (
                error instanceof PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                throw new Error('Username already in use');
            }
    
            // handle other errors
            throw error;
        }
    }

    signin() {
        return { msg: 'I have signed in' };
    }
}