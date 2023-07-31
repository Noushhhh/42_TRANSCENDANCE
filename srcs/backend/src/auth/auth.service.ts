import { ForbiddenException, Injectable, Req } from '@nestjs/common';
// import { User, Bookmark } from  '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client'
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';

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

    async signToken42(@Req() req: any) {
        const code = req.query['code'];
        const token = await this.exchangeCodeForToken(code);
        if (token) {
          const userInfo = await this.getUserInfo(token);
          console.log('User Info:', userInfo);
          // Handle the response data here, such as saving the user info or other data.
        } else {
          console.error('Failed to fetch access token');
          // Handle errors here
        }
      }
    
      private async exchangeCodeForToken(code: string): Promise<string | null> {
        try {
          const response = await axios.post('https://api.intra.42.fr/oauth/token', null, {
            params: {
              grant_type: 'authorization_code',
              client_id: process.env.UID_42,
              client_secret: process.env.SECRET_42,
              code: code,
              redirect_uri: 'http://localhost:4000/api/auth/token',
            },
          });
          return response.data.access_token;
        } catch (error) {
          console.error('Error fetching access token:', error);
          return null;
        }
      }
    
      private async getUserInfo(token: string): Promise<any> {
        try {
          const response = await axios.get('https://api.intra.42.fr/v2/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        //   return response.data;
        // if ()
        
        this.saveUserToDatabase(response.data);
        } catch (error) {
          console.error('Error fetching user info:', error);
          throw error;
        }
      }
      
      // Function to save user information in the database
        async saveUserToDatabase(userInfo: any): Promise<void> {
            const existingUser = await this.prisma.user.findUnique({
                where: {
                    id: userInfo.id,
                },
            });
    
            // If user already exists, don't create a new one
            if (existingUser) {
                console.log('User already exists:', existingUser);
                return;
            }
            const prisma = new PrismaClient();
        try {
            const user = await this.prisma.user.create({
                data: {
                id: userInfo.id,
                hashPassword: 'x',
                username: userInfo.login,
                email: userInfo.email,
                firstName: userInfo.first_name,
                lastName: userInfo.last_name,
                // profilePic: userInfo.image_link,
            },
        });
             console.log(user);
        } catch (error) {
            console.error('Error saving user information to database:', error);
            throw error;
        }
        }

}