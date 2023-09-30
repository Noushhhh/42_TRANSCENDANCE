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

    // ─────────────────────────────────────────────────────────────────────────────

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
    // ─────────────────────────────────────────────────────────────────────────────

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
        const result = await this.signToken(user.id, user.username, res);
        res.status(result.statusCode).send({ valid: result.valid, message: 'Authentication successful' });
    }
    // ─────────────────────────────────────────────────────────────────────────────

    async generateAndSetTokens(userId: number, email: string, res: Response): Promise<{ token: string, refreshToken: any }> {
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
        const refreshToken = await this.createRefreshToken(userId);
    
        if (refreshToken) {
            // Save refresh token in an HttpOnly cookie
            res.cookie('refreshToken', refreshToken.refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: (refreshToken.ExpirationDate.getTime() - Date.now())
            });
        }
    
        // Existing JWT token cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 1000 * 60 * 15
        });
    
        return { token, refreshToken };
    }
    

    // ─────────────────────────────────────────────────────────────────────────────

    async signToken(userId: number, email: string, res: Response): Promise<any> {
        const { token, refreshToken } = await this.generateAndSetTokens(userId, email, res);

        if (!refreshToken) {
            return ({
                statusCode: 409,
                valid: false,
                message: "Problem creating refresh token"
            });
        }

        // Decode the token to get the expiration time
        const decodedToken = jwt.verify(token, this.JWT_SECRET);

        if (typeof decodedToken === 'object' && 'exp' in decodedToken) {
            // Set the tokenExpires cookie with the decoded expiration time
            res.cookie('tokenExpires', new Date((decodedToken as { exp: number }).exp * 1000).toISOString(), {
                secure: true,
                sameSite: 'strict',
                maxAge: 1000 * 60 * 15
            });
        } else {
            return ({
                statusCode: 409,
                valid: false,
                message: "Impossible to decode token to create expiration time"
            });
        }
        return ({
            statusCode: 200,
            valid: true,
            message: "Authentication successful"
        });
    }


    // ─────────────────────────────────────────────────────────────────────────────

    async createRefreshToken(userId: number): Promise<{
        ExpirationDate: Date,
        refreshToken: string
    } | null> {
        // Fetch the user's username using the userId
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { username: true },
        });

        if (!user) {
            throw new Error('User not found');
        }

        const refreshToken = randomBytes(40).toString('hex'); // Generates a random 40-character hex string

        const expiration = new Date();
        expiration.setDate(expiration.getDate() + 7); // Set refreshToken expiration date within 7 days

        try {
            // Save refreshToken to database along with userId and userName
            await this.prisma.refreshToken.create({
                data: {
                    token: refreshToken,
                    userId: userId,
                    userName: user.username,
                    expiresAt: expiration,
                },
            });
            return ({ ExpirationDate: expiration, refreshToken: refreshToken });
        } catch (error) {
            return null;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────────

    async checkTokenValidity(req: Request) {
        const token = req.cookies.token;

        if (!token) {
            return ({
                statusCode: 401,
                valid: false,
                message: "Token Missing"
            })
        }

        try {
            const result = jwt.verify(token, this.JWT_SECRET);
            console.log(result);
            return ({
                statusCode: 200,
                valid: true,
                message: "Token is valid"
            })
        } catch (error) {
            return ({
                statusCode: 401,
                valid: false,
                message: "Invalid token" + error
            })
        }
    }

    // ─────────────────────────────────────────────────────────────────────────────
    async signout(res: Response) {
        try {
            // Clear the JWT and refresh token cookies
            res.clearCookie('token');
            res.clearCookie('refreshToken');
            res.clearCookie('tokenExpires');

            return ({ statusCode: 200, valid: true, message: "Signed out successfully" });
        } catch (error) {
            console.error(error);
            return ({
                statusCode: 401, valid: false, message: " Error signing out" + error
            })
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


    async getUsernameFromId(id: number): Promise<string | undefined> {
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
            if (user) {
                console.log(user.username);
                return user.username;
            }
            else {
                return undefined;
            }
        } catch (error) {
            throw error;
        }
    }

    async refreshToken(req: Request, res: Response) {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return ({
                statusCode: 401,
                valid: false,
                message: "Refresh token missing"
            })
        }

        // Find the refresh token in the database
        const storedToken = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
        });

        if (!storedToken) {
            return ({
                statusCode: 401,
                valid: false,
                message: "Invalid refresh token"
            })
        }

        // Check if the refresh token is expired
        const now = new Date();
        if (storedToken.expiresAt < now) {
            return ({
                statusCode: 401,
                valid: false,
                message: "Refresh token expired"
            })
        }

        // Generate a new access token
        try {
            await this.signToken(storedToken.userId, storedToken.userName, res);
            return ({
                statusCode: 200,
                valid: true,
                message: "New access token created successfully"
            })

        } catch (error) {
            return ({
                statusCode: 409,
                valid: false,
                message: error
            })
        }

    }
}