import { InternalServerErrorException, ForbiddenException, Res, Req, Injectable, UnauthorizedException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../auth/constants/constants';
import { DecodedPayload } from '../interfaces/decoded-payload.interface';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { Request, Response } from 'express';
import { randomBytes } from 'crypto';
import * as jwt from 'jsonwebtoken';
import axios from 'axios';
import * as speakeasy from 'speakeasy';
import { ExtractJwt } from '../decorators/extract-jwt.decorator';
import { v4 as uuidv4 } from 'uuid';
import cron from 'node-cron'; // Importing node-cron for scheduling tasksd
import { StrictEventEmitter } from 'socket.io/dist/typed-events';
import QRCode from 'qrcode'



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
    console.log(`passing by signup service username: ${dto.username} password ${dto.password}`);
    try {
      const user = await this.prisma.user.create({
        data: {
          username: dto.username,
          hashPassword,
          fortyTwoStudent: false,
          avatar: null
        },
      });
      console.log(`passing by signup service after user result from prisma ${user.id}, ${user.username}, ${user.hashPassword}`);
      // return this.signToken(user.id, user.username, res);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('This username is already taken. Please choose another one.');
        }
      }
      throw error;
    }
    return res.status(201).json({ valid: true, message: "user was create successfully" });
  }


  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * @brief This function handles user signin requests.
   * @param dto The data transfer object containing user information.
   * @param res The response object.
   * @return The result of the signin operation.
   */
  async signin(dto: AuthDto, res: Response, req: Request) {

    if (req.cookies['userSession']) {
      throw new ForbiddenException('A user is already logged in. Please log out before logging in as a different user.');
    }
    const user = await this.usersService.findUserWithUsername(dto.username);
    if (!user) throw new ForbiddenException('Username not found');

    const passwordMatch = await argon.verify(user.hashPassword, dto.password);
    if (!passwordMatch) throw new ForbiddenException('Incorrect password');

    // Enhanced session check logic
    if (user.sessionExpiresAt && new Date(user.sessionExpiresAt) > new Date()) {
      throw new ForbiddenException('User is already logged in');
    }
  
    if (await this.is2FaEnabled(user.id) === false) {
      const result = await this.signToken(user.id, user.username, res);
      if (!result.valid) {
        // Consider providing more detailed feedback based on the error
        throw new ForbiddenException('Authentication failed');
      }

      res.status(200).send({ valid: result.valid, message: result.message, userId: null });
    } else {
      res.status(200).send({ valid: true, message: "2FA", userId: user.id });
    }
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

  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * @brief This function checks if there is an existing refresh token for the user and returns it if it exists. If not, it creates a new refresh token.
   * @param userId The user's ID.
   * @return An object containing the token and its expiration date.
   */
  async refreshTokenIfNeeded(userId: number): Promise<{ token: string, expiresAt: Date }> {
    try {
      const existingRefreshToken = await this.prisma.refreshToken.findFirst({
        where: {
          userId: userId,
          expiresAt: { gte: new Date(), },
        },
      });

      if (existingRefreshToken) {
        return { token: existingRefreshToken.token, expiresAt: existingRefreshToken.expiresAt };
      } else {
        const newRefreshToken = await this.createRefreshToken(userId);
        return { token: newRefreshToken.token, expiresAt: newRefreshToken.ExpirationDate };
      }
    } catch (error) {
      throw new InternalServerErrorException('Failed to find or create refresh token for user');
    }
  }


  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Generates JWT and refresh tokens for a user and updates session information in the database.
   * @param userId - The ID of the user.
   * @param email - The email of the user.
   * @returns An object containing the generated JWT and refresh tokens, along with their expiration information.
   */
  async generateTokens(userId: number, email: string): Promise<{ newToken: { token: string, expiresAt: Date }, refreshToken: { token: string, expiresAt: Date } }> {
    const payload = { sub: userId, email };
    const secret = this.JWT_SECRET;
    const tokenExpiration = process.env.JWT_EXPIRATION || '15m'; // Example of using an environment variable

    let token, tokenExpiresAt;
    try {
      token = await this.jwt.signAsync(payload, { expiresIn: tokenExpiration, secret });
      tokenExpiresAt = new Date(Date.now() + this.convertToMilliseconds(tokenExpiration));

    } catch (error) {
      if (error instanceof Error)
        throw new Error("Error generating JWT token: " + error.message);
      else
        throw new Error("Error generating JWT token");
    }

    let refreshToken;
    try {
      refreshToken = await this.refreshTokenIfNeeded(userId);
    } catch (error) {
      if (error instanceof Error)
        throw new Error("Error generating refresh token: " + error.message);
      else
        throw new Error("Error generating refresh token");
    }

    const sessionId = this.generateSessionId();
    const sessionExpiresAt = tokenExpiresAt; // Aligning session expiration with JWT expiration

    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { sessionId, sessionExpiresAt },
      });
    } catch (error) {
      if (error instanceof Error)
        throw new Error("Error updating user session in database: " + error.message);
      else
        throw new Error("Error updating user session in database");
    }
    let newToken = { token: token, expiresAt: tokenExpiresAt }
    return { newToken, refreshToken };
  }


  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Sets JWT and refresh tokens in HTTP-only cookies on the response object.
   * @param tokens - Object containing the JWT token and refresh token with their expiration times.
   * @param res - HTTP response object to set cookies on.
   */
  setTokens(tokens: { newToken: { token: string, expiresAt: Date }, refreshToken: { token: string, expiresAt: Date } }, res: Response) {
    // Error handling for undefined tokens
    if (!tokens || !tokens.newToken.token || !tokens.refreshToken || !tokens.refreshToken.token) {
      throw new Error("Invalid or missing tokens provided.");
    }

    // Set refresh token cookie
    const refreshTokenMaxAge = tokens.refreshToken.expiresAt.getTime() - Date.now();
    res.cookie('refreshToken', tokens.refreshToken.token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: refreshTokenMaxAge
    });

    // Assuming the JWT token also has an expiresAt property to calculate its maxAge
    const tokenMaxAge = tokens.newToken.expiresAt.getTime() - Date.now(); // tokens.newToken.tokenExpiresAt needs to be provided
    res.cookie('token', tokens.newToken.token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: tokenMaxAge
    });

    const sessionValue = this.generateSessionId(); // Or another method to generate session identifier

    // Set the session cookie in the response
    res.cookie('userSession', sessionValue, {
      httpOnly: true, // Makes the cookie inaccessible to client-side scripts
      secure: process.env.NODE_ENV === 'production', // Ensures cookie is sent over HTTPS
      sameSite: 'strict', // Controls whether the cookie is sent with cross-origin requests
      maxAge: tokenMaxAge  // Sets the cookie to expire in 1 day (example)
    });
  }


  // ─────────────────────────────────────────────────────────────────────────────


  /**
   * @brief This function signs a token.
   * @param userId The user's ID.
   * @param username The user's username.
   * @param res The response object.
   * @return A promise that resolves to void.
   */
  async signToken(userId: number, email: string, res: Response): Promise<any> {
    const { newToken, refreshToken } = await this.generateTokens(userId, email);
    this.setTokens({ newToken, refreshToken }, res);

    if (!refreshToken) {
      throw new ConflictException("Problem creating refresh token for user")
    }

    /*     const decodedToken = jwt.verify(newToken.token, this.JWT_SECRET);
        if (typeof decodedToken === 'object' && 'exp' in decodedToken) {
          res.cookie('tokenExpires', new Date((decodedToken as { exp: number }).exp * 1000).toISOString(),
            { secure: true, sameSite: 'strict', maxAge: 1000 * 60 * 15 });
        } else {
          return ({ statusCode: 409, valid: false, message: "Impossible to decode token to create expiration time for user" });
        }
    
        const sessionId = this.generateSessionId();
        await this.prisma.user.update({
          where: { id: userId },
          data: { sessionId },
        });
     */
    return ({ statusCode: 200, valid: true, message: "Authentication successful" });
  }

  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * @brief This function creates a refresh token.
   * @param userId The user's ID.
   * @return token: string, ExpirationDate: Date 
   */
  async createRefreshToken(userId: number): Promise<{ token: string, ExpirationDate: Date }> {
    const refreshToken = randomBytes(40).toString('hex');
    const expiration = new Date();
    expiration.setDate(expiration.getDate() + 7);

    try {
      await this.prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: userId,
          expiresAt: expiration
        }
      });

      return { token: refreshToken, ExpirationDate: expiration };
    } catch (error) {
      throw new InternalServerErrorException('Failed to create refresh token');
    }
  }


  // ─────────────────────────────────────────────────────────────────────────────
  async checkOnlyTokenValidity(token: string): Promise<number | null> {

    if (!token)
      throw new ForbiddenException("Token not provided");

    try {
      const user = jwt.verify(token, this.JWT_SECRET);
      if (!user)
        return null;
      if (user.sub)
        return Number(user.sub);
    } catch (error) {
      return null;
    }
    return null;
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
      throw new UnauthorizedException('Token Missing');

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
    if (!decodedPayload)
      throw new ForbiddenException("problem obtaining paylod when signing out");
    try {
      await this.prisma.user.update({
        where: { id: decodedPayload.sub },
        data: { sessionId: null, sessionExpiresAt: null },
      });

      // Clear the JWT cookie or session
      res.clearCookie('token');
      res.clearCookie('refreshToken');
      res.clearCookie('userSession');
      return res.status(200).send({ message: 'Signed out successfully' });
    } catch (error) {
      console.error(error);
      throw error;
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
      console.log(`passing by singToken42 req.query['code']: ${code}`);
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
      const refreshToken = await this.createRefreshToken(user.id);

      res.cookie('token', jwtToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 1000 * 60 * 15 // 15 minutes in milliseconds
      });

      res.cookie('refreshToken', refreshToken.token, {
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
      throw new InternalServerErrorException('Internal server error');
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
      console.log(`passing by exchangeCodeForToken:  ${response} = await this.sendAuthorizationCodeRequest(code)`);
      return response.data.access_token;
    } catch (error) {
      console.error('Error fetching access token:', error);
      return null;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  private async sendAuthorizationCodeRequest(code: string) {
    try {
      const requestBody = {
        grant_type: 'authorization_code',
        client_id: process.env.UID_42,
        client_secret: process.env.SECRET_42,
        code: code,
        redirect_uri: 'http://localhost:4000/api/auth/callback42',
      };
      return axios.post('https://api.intra.42.fr/oauth/token', null, { params: requestBody });

    } catch (error) {
      throw error;  
    }
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
      const avatarFile: Express.Multer.File = await this.usersService.downloadFile(avatarUrl); 

      const user = await this.prisma.user.create({
        data: {
          id: userInfo.id,
          hashPassword: this.generateRandomPassword(),
          username: userInfo.login,
          avatar: null,
        },
      });

      await this.usersService.updateAvatar(user.id, avatarFile);
      const { secret, otpauthUrl } = this.generateTwoFASecret(user.id);
      user.twoFASecret = secret;
      user.twoFAUrl = otpauthUrl;
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
    const secret = speakeasy.generateSecret();

    return { secret: secret.base32, otpauthUrl: secret.otpauth_url! };
  }

  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * @brief This function verifies a 2FA code.
   * @param userId The user's ID.
   * @param code The 2FA code.
   * @return Whether the 2FA code is verified.
   */
  async verifyTwoFACode(userId: number, code: string, res: Response): Promise<boolean> {
    try {
      const user: User | null = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (!user.twoFASecret) return false;

      const verified = speakeasy.totp.verify({
        secret: user.twoFASecret,
        encoding: 'base32',
        token: code,
      });

      if (!verified) {
        console.error(`Passing by verifyTwoFAcode vefied: ${verified}`);
        throw new ForbiddenException('Provided code couldn\'d be verified');
      }

      if (verified === true) {
        const result = await this.signToken(user.id, user.username, res);
        if (!result.valid) {
          // Consider providing more detailed feedback based on the error
          throw new ForbiddenException('Authentication failed');
        }
        res.status(200).send({ valid: result.valid, message: result.message, userId: null });
      }

      return verified;

    } catch (error) {
      throw error;
    }
  }

  async validateTwoFA(userId: number, code: string): Promise<boolean> {
    const user: User | null = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const secret = user.twoFASecret;

    if (!secret) return false;

    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code
    });

    if (verified === true) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          TwoFA: true,
        },
      });
    }

    return verified;
  }

  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * @brief This function enables 2FA.
   * @param userId The user's ID.
   */
  async enable2FA(userId: number): Promise<string> {
    const { secret, otpauthUrl } = this.generateTwoFASecret(userId);

    // @to-do CHECK SI LE USER EXIST 
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        TwoFA: false,
        twoFASecret: secret,
      },
    });

    const generateQR = async (otpauthUrl: string) => {
      try {
        const url = await QRCode.toDataURL(otpauthUrl);
        return url;
      } catch (err) {
        console.error(err)
      }
    }

    const QRUrl = await generateQR(otpauthUrl);
    if (QRUrl)
      return QRUrl;

    return "";
  }

  async disable2FA(userId: number) {
    const user: User | null = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFASecret: null,
        TwoFA: false,
      },
    });
  }

  async is2FaEnabled(userId: number): Promise<Boolean> {
    const user: User | null = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.TwoFA;
  }

  // Method to generate a unique session identifier
  private generateSessionId(): string {
    return uuidv4(); // Generates and returns a new UUID (v4)
  }

  private convertToMilliseconds(timeStr: string): number {
    const timeValue = parseInt(timeStr.slice(0, -1), 10);
    const timeUnit = timeStr.slice(-1);

    switch (timeUnit) {
      case 'd': // Days
        return timeValue * 24 * 60 * 60 * 1000;
      case 'h': // Hours
        return timeValue * 60 * 60 * 1000;
      case 'm': // Minutes
        return timeValue * 60 * 1000;
      case 's': // Seconds
        return timeValue * 1000;
      default:
        throw new Error(`Unsupported time format: ${timeStr}`);
    }
  }


}