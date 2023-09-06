import { ForbiddenException, Injectable, Req, Redirect } from '@nestjs/common';
// import { User, Bookmark } from  '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client'
import { AuthTokenDto, SignUpDto, SignInDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
// import { PrismaClient } from '@prisma/client';
// import { Redirect } from '@nestjs/redirect';


@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
        // private config: ConfigService
    ) {}

    // @Redirect('/')
    async signup(dto: SignUpDto) : Promise <AuthTokenDto>
    {
        const { email, username, password } = dto;
        // generate password hash
        const hashPassword = await argon.hash(password);
        // save user in db
        try {
            const user = await this.prisma.user.create({
              data: {
                email,
                username,
                hashPassword,
              },
            });
            return this.signJwtToken(user.id, user.username);
            // return user;
          } catch (error) 
          {
            // if email already used
              if (error instanceof Prisma.PrismaClientKnownRequestError) {
                console.log(error)
              if (error.code === 'P2002') {
                throw new ForbiddenException('Credentials taken');
              }
            }
            throw error; // throw error code Nest httpException
          }
    }          

    async signin(dto: SignInDto) 
    {
      const { username, password } = dto;
      // find user with username
      const user = await this.prisma.user.findUnique({
          where: {
              username,
          }
      });
      // if user not found throw exception
      if (!user)
          throw new ForbiddenException('Username not found',);
      
      // compare password
      const passwordMatch = await argon.verify(user.hashPassword, password,);
      
      // if password wrong throw exception
      if (!passwordMatch)
          throw new ForbiddenException('Incorrect password',);
      // handle if 2FA
      // if (user.TwoFA = true)
      // {
        
      // }
      // send back the token
      return this.signJwtToken(user.id, user.username);
    }

    async signJwtToken(
        userId: number,
        email: string,
        ): Promise <AuthTokenDto> 
    {
      const login_data = { 
          sub: userId,
          email,
      };
      // set params Jwt Token
      const secret = process.env.JWT_SECRET
      const token = await this.jwt.signAsync(
          login_data, 
          {
              expiresIn: '15m',
              secret: secret,
          },
      );
      return {
          access_token: token,
          // AuthTokenDto,
      };
    }

    async signToken42(@Req() req: any) {
        const code = req.query['code'];
        const token = await this.exchangeCodeForToken(code);
        if (token) {
          const userInfo = await this.getUserInfo(token);
          console.log('User Info:', userInfo);
          // redirect to homepage 
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
          console.log(response)
        
        this.createUser(response.data);
        } catch (error) {
          console.error('Error fetching user info:', error);
          throw error;
        }
      }
      
      // Function to save user information in the database
      async createUser(userInfo: any): Promise<void> {
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
        // const prisma = new PrismaClient();
        try {
            const user = await this.prisma.user.create({
                data: {
                id: userInfo.id,
                hashPassword: 'x', // random password? 
                username: userInfo.login,
                email: userInfo.email,
                // avatar: userInfo.image.link,
            },
        });
             console.log(user);
        } catch (error) {
            console.error('Error saving user information to database:', error);
            throw error;
        }
        }
}