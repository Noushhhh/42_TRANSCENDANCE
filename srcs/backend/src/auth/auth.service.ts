import { ForbiddenException, Res, Req, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { randomBytes } from 'crypto';
import * as jwt from 'jsonwebtoken';
import axios from 'axios';
import * as speakeasy from 'speakeasy';
import { UsersService } from '../users/users.service';
import { jwtConstants } from '../auth/constants/constants';
import { ExtractJwt } from '../decorators/extract-jwt.decorator';
import { DecodedPayload } from '../interfaces/decoded-payload.interface';


/**
 * @file auth.service.ts
 * @author Your Name
 * @date 2023-10-18
 * @brief This file contains the AuthService class, which provides authentication-related services.
 */

/**
 * @class AuthService
 * @brief This class provides authentication-related services.
 */
@Injectable()
export class AuthService {
    private readonly JWT_SECRET: string | any;

    constructor(
        private usersService: UsersService,
        private prisma: PrismaService,
        private jwt: JwtService,
        // private jwtService: JwtService,
    ) {
        this.JWT_SECRET = jwtConstants.secret;
        if (!this.JWT_SECRET) {
            throw new Error("JWT_SECRET environment variable not set!");
        }
    }

    /**
     * @brief This function handles user signup requests.
     * @param dto The data transfer object containing user information.
     * @param res The response object.
     * @return The result of the signup operation.
     */
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

    /**
     * @brief This function handles user signin requests.
     * @param dto The data transfer object containing user information.
     * @param res The response object.
     * @return The result of the signin operation.
     */
    async signin(dto: AuthDto, res: Response) {
        // find user with username
        const user = await this.usersService.findUserWithUsername(dto.username);
        // if user not found throw exception
        if (!user) throw new ForbiddenException('Username not found',);
        const userLoggedIn = await this.checkUserLoggedIn(user.id);
        // console.log("passing by userLoggedIn", userLoggedIn, "\n");
        if (userLoggedIn.statusCode === 200) {
            throw new ForbiddenException('User is already logged in');
            console.log("user already logged in " ,userLoggedIn.statusCode);
        }
        // compare password
        const passwordMatch = await argon.verify(user.hashPassword, dto.password,);
        // if password wrong throw exception
        if (!passwordMatch) throw new ForbiddenException('Incorrect password',);
        // send back the token
        return this.signToken(user.id, user.username, res);
    }

  /**
   * @brief This function validates a user.
   * @param dto The data transfer object containing user information.
   * @return The user if found, otherwise throws an UnauthorizedException.
   */
  async validateUser(dto: AuthDto): Promise<any> {
    const user = await this.usersService.findUserWithUsername(dto.username);
    if (!user)
      throw new UnauthorizedException();
    return user;
  }

  /**
   * @brief This function signs a token.
   * @param userId The user's ID.
   * @param username The user's username.
   * @param res The response object.
   * @return A promise that resolves to void.
   */
  async signToken(
    userId: number,
    username: string,
    res: Response
  ): Promise<void> {
    const payload = {
      sub: userId,
      username,
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

    // Save refresh token in an HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true, // set it to false if you're not using HTTPS
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24 * 30 * 30  // 30 days in milliseconds
    });

    // Existing JWT token cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 15 // 15 minutes in milliseconds
    });

    //set user to logging (true) in the data base
    this.updateUserLoggedIn(userId, true);
    //send respond confiming frontend authentication was successfull
    res.status(200).send({ message: 'Authentication successful' });
  }

// ─────────────────────────────────────────────────────────────────────────────

    /**
     * @brief This function creates a refresh token.
     * @param userId The user's ID.
     * @return The refresh token.
     */
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

  /**
   * @brief This function updates the user's logged in status.
   * @param userId The user's ID.
   * @param inputBoolean The new logged in status.
   */
  async updateUserLoggedIn(userId: number, inputBoolean: boolean) {
    //update user login status 
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        loggedIn: inputBoolean,
      },
    });

  }

// ─────────────────────────────────────────────────────────────────────────────

  /**
   * @brief This function checks if the user is logged in.
   * @param userId The user's ID.
   * @return The user's logged in status.
   */
  async checkUserLoggedIn(userId: number) {
    try {
      const user: any = await this.usersService.findUserWithId(userId);
      if (!user)
        throw new ForbiddenException('Username not found',);
      // console.log("Passing by checkUserLoggedIn", user.loggedIn, user);
      if (user.loggedIn) {
        return ({
          statusCode: 200,
          valid: true,
          message: "User is logged in"
        });
      }
      else {
        return ({
          statusCode: 400,
          valid: true,
          message: "User is not logged in"
        });
      }

    } catch (error) {
      return ({
        statusCode: 400,
        valid: false,
        message: `Error finding userid ${userId} ` + error
      });
    }


  }

// ─────────────────────────────────────────────────────────────────────────────


  /**
   * @brief This function checks the validity of the token.
   * @param req The request object.
   * @param res The response object.
   * @return The token's validity status.
   */
  async checkTokenValidity(req: Request, res: Response) {
    const token = req.cookies.token;

    if (!token)
      return res.status(401).json({ valid: false, message: "Token Missing" });

    try {
      jwt.verify(token, this.JWT_SECRET);
      return res.status(200).json({ valid: true, message: "Token is valid" });
    } catch (error) {
      return res.status(401).json({ valid: false, message: "Invalid Token" });
    }
  }

// ─────────────────────────────────────────────────────────────────────────────
  /**
   * @brief This function handles user signout requests.
   * @param decodedPayload The decoded payload.
   * @param res The response object.
   * @return The result of the signout operation.
   */
  async signout(decodedPayload: DecodedPayload | null, res: Response) {
    // Clear the JWT cookie or session
    if (!decodedPayload)
      return;
    try {
      res.clearCookie('token'); // assuming the token is saved in a cookie named 'token'
      this.updateUserLoggedIn(decodedPayload.sub, false)
      return res.status(200).send({ message: 'Signed out successfully' });
    } catch (error) {
      console.error(error);
      return res.status(401).send({ message: "Cookie not found" });
    }
  }

// ─────────────────────────────────────────────────────────────────────────────
  /**
   * @brief This function signs a token for 42 authentication.
   * @param req The request object.
   * @param res The response object.
   */
  async signToken42(@Req() req: any, res: Response) {
    try {
      const code = req.query['code'];
      const token = await this.exchangeCodeForToken(code);
      if (!token) {
        console.error('Failed to fetch access token');
        throw new Error('Failed to fetch access token');
      }
      const userInfo = await this.getUserInfo(token);
      const user = await this.createUser(userInfo, res);

      if (user.TwoFA == true) {

      }

      // Set both JWT token and refresh token as cookies
      const payload = {
        sub: user.id,
        username: user.username,
      };
      const secret = this.JWT_SECRET;
      const jwtToken = await this.jwt.signAsync(payload, {
        expiresIn: '15m',
        secret: secret,
      });
      const refreshToken = this.createRefreshToken(user.id);

      res.cookie('token', jwtToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 1000 * 60 * 15 // 15 minutes in milliseconds
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 1000 * 60 * 60 * 24 * 30 // 30 days in milliseconds
      });

      // Redirect the user to the desired URL after successful authentication
      res.redirect('http://localhost:8081/home');
    } catch (error) {
      console.error('Error in signToken42:', error);
      // Handle errors here, e.g., return an error response
      res.status(500).send({ message: 'Internal Server Error' });
    }
  }

// ─────────────────────────────────────────────────────────────────────────────

  /**
   * @brief This function exchanges a code for a token.
   * @param code The code.
   * @return The token or null if the exchange fails.
   */
  async exchangeCodeForToken(code: string): Promise<string | null> {
    try {
      const response = await this.sendAuthorizationCodeRequest(code);
      return response.data.access_token;
    } catch (error) {
      console.error('Error fetching access token:', error);
      return null;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  private async sendAuthorizationCodeRequest(code: string) {
    const requestBody = {
      grant_type: 'authorization_code',
      client_id: process.env.UID_42,
      client_secret: process.env.SECRET_42,
      code: code,
      redirect_uri: 'http://localhost:4000/api/auth/callback42',
    };
    return axios.post('https://api.intra.42.fr/oauth/token', null, { params: requestBody });
  }
// ─────────────────────────────────────────────────────────────────────────────


  /**
   * @brief This function creates a user.
   * @param userInfo The user info.
   * @param res The response object.
   * @return The user.
   */
  private async getUserInfo(token: string): Promise<any> {
    try {
      const response = await this.sendUserInfoRequest(token);
      return response.data;
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  }
// ─────────────────────────────────────────────────────────────────────────────


  private async sendUserInfoRequest(token: string) {
    return axios.get('https://api.intra.42.fr/v2/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

// ─────────────────────────────────────────────────────────────────────────────


  /**
   * @brief This function creates a user.
   * @param userInfo The user info.
   * @param res The response object.
   * @return The user.
   */
  async createUser(userInfo: any, res: Response): Promise<User> {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        id: userInfo.id,
      },
    });

    if (existingUser) {
      console.log('User already exists:', existingUser);
      //   return "User already exists";
      existingUser.firstConnexion = false;
      return existingUser;
    }

    try {
      let avatarUrl;
      if (userInfo.image.link !== null) {
        // use the 42 profile picture if not null
        avatarUrl = userInfo.image.link;
      }
      const user = await this.prisma.user.create({
        data: {
          id: userInfo.id,
          hashPassword: this.generateRandomPassword(),
          username: userInfo.login,
          avatar: userInfo.image.link,
        },
      });
      const { secret, otpauthUrl } = this.generateTwoFASecret(user.id);
      user.twoFASecret = secret;
      user.twoFAUrl = otpauthUrl;
      console.log("User created", user);
      return user;
    } catch (error) {
      console.error('Error saving user information to database:', error);
      throw error;
    }
  }

// ─────────────────────────────────────────────────────────────────────────────

  /**
   * @brief This function generates a random password.
   * @return The password.
   */
  generateRandomPassword(): string {
    const password =
      Math.random().toString(36).slice(2, 15) +
      Math.random().toString(36).slice(2, 15);
    return password;
  }

  // ─────────────────────────────────────────────────────────────────────

  /**
   * @brief This function generates a 2FA secret.
   * @param userId The user's ID.
   * @return The 2FA secret and otpauth URL.
   */
 
  generateTwoFASecret(userId: number): { secret: string; otpauthUrl: string } {
    const secret = speakeasy.generateSecret({ length: 20 }); // Generate a 20-character secret
    const otpauthUrl = speakeasy.otpauthURL({
      secret: secret.base32,
      label: `ft_transcendance:${userId}`, // Customize the label as needed
      issuer: 'ft_transcendance', // Customize the issuer as needed
    });
    return { secret: secret.base32, otpauthUrl };
  }

// ─────────────────────────────────────────────────────────────────────────────

  /**
   * @brief This function verifies a 2FA code.
   * @param userId The user's ID.
   * @param code The 2FA code.
   * @return Whether the 2FA code is verified.
   */
  async verifyTwoFACode(userId: number, code: string): Promise<boolean> {
    const user: User | null = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFASecret || '',
      encoding: 'base32',
      token: code,
    });

    return verified;
  }

// ─────────────────────────────────────────────────────────────────────────────

  /**
   * @brief This function enables 2FA.
   * @param userId The user's ID.
   */
  async enable2FA(userId: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        TwoFA: true,
      },
    });

  }
}