import { ForbiddenException, Injectable } from '@nestjs/common';
// import { User, Bookmark } from  '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClient, Prisma } from '@prisma/client'
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
// import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
    ) {}

    async signup(dto: AuthDto) 
    {
        // generate password hash
        const hashPassword = await argon.hash(dto.password);
        // save user in db
        try {
            const user = await this.prisma.user.create({
              data: {
                username: dto.username,
                hashPassword,
              },
              select: {
                username: true,
              },
            });
            return user;
          } catch (error) 
          {
              if (error instanceof Prisma.PrismaClientKnownRequestError) {
                console.log(error)
              if (error.code === 'P2002') {
                throw new ForbiddenException('Credentials taken');
              }
            }
            throw error; // throw error code Nest httpException
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
        // delete user.hashPassword;
        return user ;

    }

//     async signToken() 
//     {
//         // find user with username
//         const user = await this.prisma.user.findUnique({
//             where: {
//                 username: dto.username,
//             }
//         });
//         // if user not found throw exception
//         if (!user)
//             throw new ForbiddenException('Username not found',);
        
//         // compare password
//         const passwordMatch = await argon.verify(user.hashPassword, dto.password,);
        
//         // if password wrong throw exception
//         if (!passwordMatch)
//             throw new ForbiddenException('Incorrect password',);

//         // send back the user
//         // delete user.hashPassword;
//         return user ;



// }

}