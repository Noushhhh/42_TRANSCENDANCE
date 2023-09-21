import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client'
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { randomBytes } from 'crypto';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {

    private JWT_SECRET: string | any;

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
            console.log('signup calle');
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
        console.log('refresh token = ');
        console.log(refreshToken);
        console.log('token = ');
        console.log(token);

        // Save refresh token in an HttpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true, // set it to false if you're not using HTTPS
            sameSite: 'none',
            maxAge: 1000 * 60 * 60 * 24 * 30 // 30 days in milliseconds
        });

        // Existing JWT token cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 1000 * 60 * 15 // 15 minutes in milliseconds
        });

        res.status(200).send({ message: 'Authentication successful' });
        // return {
        //     access_token: token
        // }
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

    async getUsernameFromId(id: number): Promise<string | undefined>{

        const userId = Number(id);

        try {
            const user: { username: string; } | null = await this.prisma.user.findUnique({
                where: {
                    id: userId,
                },
                select: {
                    username: true,
                }
            })
            if (user){
                console.log(user.username);
                return user.username;
            }
            else{
                return undefined;
            }
        } catch (error){
            throw error;
        }
    }
}