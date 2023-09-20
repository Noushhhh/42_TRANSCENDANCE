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
        return this.signToken(user.id, user.username, res);
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

        res.status(200).send({ message: 'Authentication successful' });
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

    async signToken42(@Req() req: any) {
        const code = req.query['code'];
        try {
          const token = await this.exchangeCodeForToken(code);
          if (token) {
            const userInfo = await this.getUserInfo(token);
            const user = await this.createUser(userInfo);
            return user;
          } else {
            console.error('Failed to fetch access token');
            // Handle errors here
            throw new Error('Failed to fetch access token');
          }
        } catch (error) {
          console.error('Error in signToken42:', error);
          throw error;
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
      
      async createUser(userInfo: any): Promise<User> {
        const existingUser = await this.prisma.user.findUnique({
          where: {
            id: userInfo.id,
          },
        });
      
        if (existingUser) {
          console.log('User already exists:', existingUser);
        //   return "User already exists";
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
          const user = await this.prisma.user.create({
            data: {
                id: userInfo.id,
                hashPassword: this.generateRandomPassword(),
                // login: userInfo.login,
                username: userInfo.login,
                avatar: userInfo.image.link,
            },
          });
          console.log("User created", user);
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
