import { Controller, Post, Body, Res, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
// import { AuthGuard } from '@nestjs/passport';
import { Public } from '../decorators/public.decorators';
import { Response, Request } from 'express'

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Public()
    @Post('signup')
    async signup(@Body() dto: AuthDto, @Res() res: Response) {
        return this.authService.signup(dto, res);
    }

    @Public()
    @Post('signin')
    async signin(@Body() dto: AuthDto, @Res() res: Response) {
        return this.authService.signin(dto, res);
    }

    @Get('checkTokenValidity')
    async checkTokenValidity(@Req() req: Request, @Res() res: Response) {
        console.log("passing by checkTokenValidity");
        return this.authService.checkTokenValidity(req, res);
    }

    @Get('signout')
    async signout(@Res() res: Response){
        return this.authService.signout(res);
    }

    // change name to 42-callback 
    // @Public()
    // @Get('42Url')
    // async get42Url() {
    //     // const callback_url = encodeURIComponent(process.env.CALLBACK_URL_42);
    //     const url = "https://api.intra.42.fr/oauth/authorize?client_id=" + process.env.UID_42 + "&redirect_uri=" + "http%3A%2F%2Flocalhost%3A4000%2Fapi%2Fauth%2Ftoken&response_type=code";
    //     return (url);
    // }

    @Get('token') 
    async handle42Callback(@Req() req: Request, @Res() res: Response) {
        try {
            // const user = await this.authService.signToken42(req, res); 
            const user = await this.authService.signToken42(req);    
            // implement revesre proxy > Alex
            res.redirect('http://localhost:8081/home');
        } catch (error) {
            console.error(error);
            // Handle errors here and redirect as needed
            res.redirect('/error2');
        }
    }

    // @Post('enable2FA')
    // async enable2FA()

}


/*
import { ForbiddenException, Req, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client'
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { randomBytes } from 'crypto';
import * as jwt from 'jsonwebtoken';
import axios from 'axios';

@Injectable()
export class AuthService {

    private readonly JWT_SECRET: string | any;

    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
    ) {
        this.JWT_SECRET = process.env.JWT_SECRET;

        if (!this.JWT_SECRET) {
            throw new Error("JWT_SECRET environment variable not set!");
        }
    }

    async signup(dto: AuthDto, res: Response) {
        const hashPassword = await argon.hash(dto.password);
        try {
            const user = await this.prisma.user.create({
                data: {
                    username: dto.username,
                    hashPassword,
                },
            });
            return this.signToken(user.id, user.username, res);
            // return user;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                console.log(error)
                if (error.code === 'P2002') {
                    throw new ForbiddenException('Credentials taken');
                }
            }
            throw error;
        }
    }

    async signin(dto: AuthDto, res: Response) {
        // find user with username
        try {
          const user = await this.findUserByUsername(dto.username);
          // if user not found return error in header
          if (!user) {
            return res.status(401).json({ message: 'Username not found' });
          }
          // compare password
            const passwordMatch = await argon.verify(user.hashPassword, dto.password,);
          // if password wrong return error in header
          if (!passwordMatch) {
              // throw new ForbiddenException('Incorrect password',);
              return res.status(401).json({ message: 'Incorrect password' });
          }
          // send back the token
          const token = await this.signToken(user.id, user.username, res);
          res.status(200).json({ message: 'Authentication successful', token });
          return this.signToken(user.id, user.username, res);
        }
        catch (error) {
          console.error('Error during signin:', error);
          return res.status(500).json({ message: 'Internal server error' });
      }
    }

    async signToken(
        userId: number,
        email: string,
        res: Response
    ): Promise<void> {
        const payload = {
            sub: userId,
            email,
        };
        const secret = this.JWT_SECRET;
        const token = await this.jwt.signAsync(
            payload,
            {
                expiresIn: '15m',
                secret: secret,
            },
        );

        // Generate a refresh token
        const refreshToken = this.createRefreshToken(userId);

        // Save refresh token in an HttpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true, // set it to false if you're not using HTTPS
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60 * 24 * 30 // 30 days in milliseconds
        });

        // Existing JWT token cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 1000 * 60 * 15 // 15 minutes in milliseconds
        });

        // Send the response
        res.status(200).json({ message: 'Authentication successful' });
        // res.status(200).send({ message: 'Authentication successful' });
    }

    async createRefreshToken(userId: number): Promise<string> {
        const refreshToken = randomBytes(40).toString('hex'); // Generates a random 40-character hex string

        const expiration = new Date();

        expiration.setDate(expiration.getDate() + 7); // Set refreshToken expiration date within 7 days

        // Save refreshToken to database along with userId
        await this.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: userId,
                expiresAt: expiration
            }
        });
        return refreshToken;
    }

    async checkTokenValidity(req: Request, res: Response) {
        const token = req.cookies.token;

        console.log("passing by checktokenvalidity");
        if (!token)
            return res.status(401).json({ valid: false, message: "Token Missing" });

        try {
            jwt.verify(token, this.JWT_SECRET);
            return res.status(200).json({ valid: true, message: "Token is valid" });
        } catch (error) {
            return res.status(401).json({ valid: false, message: "Invalid Token" });
        }
    }

    signout(res: Response): Response {
        // Clear the JWT cookie or session
        try {
            res.clearCookie('token'); // assuming your token is saved in a cookie named 'token'
            return res.status(200).send({ message: 'Signed out successfully' });
        } catch (error) {
           console.error(error); 
           return res.status(401).send({message: "Cookie not found"});
        }
    }    

    async signToken42(@Req() req: any, res: Response) {
        const code = req.query['code'];
        try {
          const token = await this.exchangeCodeForToken(code);
          if (token) {
            const userInfo = await this.getUserInfo(token);
            const user = await this.createUser(userInfo, res);
            // return user;
          } else {
            console.error('Failed to fetch access token');
            // Handle errors here
            throw new Error('Failed to fetch access token');
          }
        } catch (error) {
          console.error('Error in signToken42:', error);
          throw new Error('Failed to fetch sign Token 42');
        }
      }
      
      async exchangeCodeForToken(code: string): Promise<string | null> {
        try {
          const response = await this.sendAuthorizationCodeRequest(code);
          return response.data.access_token;
        } catch (error) {
          console.error('Error fetching access token:', error);
          return null;
        }
      }
      
      private async sendAuthorizationCodeRequest(code: string) {
        const requestBody = {
          grant_type: 'authorization_code',
          client_id: process.env.UID_42,
          client_secret: process.env.SECRET_42,
          code: code,
          redirect_uri: 'http://localhost:4000/api/auth/token',
        };
        return axios.post('https://api.intra.42.fr/oauth/token', null, { params: requestBody });
      }
      
      private async getUserInfo(token: string): Promise<any> {
        try {
          const response = await this.sendUserInfoRequest(token);
        //   const this.createUser(response.data);
          return response.data;
        } catch (error) {
          console.error('Error fetching user info:', error);
          throw error;
        }
      }
      
      private async sendUserInfoRequest(token: string) {
        return axios.get('https://api.intra.42.fr/v2/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      
      async createUser(userInfo: any, res: Response): Promise<User>  {
        const existingUser = await this.prisma.user.findUnique({
          where: {
            id: userInfo.id,
          },
        });
      
        if (existingUser) {
            console.log('User already exists:', existingUser);
          // return this.signToken(existingUser.id, existingUser.username, res);
          //   return "User already exists";
            existingUser.firstConnexion = false;
            this.signToken(existingUser.id, existingUser.username, res);
            return existingUser;
        }
      
        try {
            let avatarUrl;
            if (userInfo.image.link === null) {
                // Generate a random avatar URL or use a default one
                avatarUrl = 'https://cdn.intra.42.fr/coalition/cover/302/air__1_.jpg';
            } else {
                avatarUrl = userInfo.image.link;
            }
          let password = this.generateRandomPassword();
          password = await argon.hash(password);
          const user = await this.prisma.user.create({
            data: {
                id: userInfo.id,
                hashPassword: password,
                // login: userInfo.login,
                username: userInfo.login,
                avatar: userInfo.image.link,
            },
          });
          console.log("User created", user);
          this.signToken(user.id, user.username, res);
          return user;
        } catch (error) {
          console.error('Error saving user information to database:', error);
          throw error;
        }
      }
      
      generateRandomPassword(): string {
        const password =
          Math.random().toString(36).slice(2, 15) +
          Math.random().toString(36).slice(2, 15);
        return password;
      }
      
      private async findUserByUsername(username: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: {
                username,
            },
        });

    }

  }
    // async getUsernameFromId(id: number): Promise<string | undefined>{

    //     const userId = Number(id);

    //     try {
    //         const user: { username: string; } | null = await this.prisma.user.findUnique({
    //             where: {
    //                 id: userId,
    //             },
    //             select: {
    //                 username: true,
    //             }
    //         })
    //         if (user){
    //             console.log(user.username);
    //             return user.username;
    //         }
    //         else{
    //             return undefined;
    //         }
    //     } catch (error){
    //         throw error;
    //     }
    // }
*/