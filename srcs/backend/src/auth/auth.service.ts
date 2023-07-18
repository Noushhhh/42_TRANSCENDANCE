import { ForbiddenException, Injectable } from '@nestjs/common';
// import { User, Bookmark } from  '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client'
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
// import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
        // private config: ConfigService
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
            //   select: {
            //     username: true,
            //   },
            });
            return this.signToken(user.id, user.username);
            // return user;
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

        // send back the token
        return this.signToken(user.id, user.username);

    }

    async signToken(
        userId: number,
        email: string,
        ): Promise < { access_token: string} > 
    {
        const payload = { 
            sub: userId,
            email,
        };
        // const secret = this.config.get('JWT_SECRET');
        const secret = process.env.JWT_SECRET
        const token = await this.jwt.signAsync(
            payload, 
            {
                expiresIn: '15m',
                secret: secret,
            },
        );

        return {
            access_token: token,
        };
    }

}