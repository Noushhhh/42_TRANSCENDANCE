import {
  ForbiddenException, Res,
  Req, Injectable, UnauthorizedException, NotFoundException,
  HttpStatus, Logger, HttpException, ConflictException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User , Session} from '@prisma/client';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../auth/constants/constants';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { Request, Response } from 'express';
import { randomBytes } from 'crypto';
import * as jwt from 'jsonwebtoken';
import axios from 'axios';
import * as speakeasy from 'speakeasy';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode'
import { hasMessage } from '../tools/has-message.tools';
import { DEFAULT_AVATAR_PATH } from './constants/constants'; //import defaul avatar



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
  private readonly logger = new Logger(AuthService.name);
  private currentUser: User | null = null;
  private readonly API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

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
          fortyTwoStudent: false,
          avatar: DEFAULT_AVATAR_PATH, //define default avatar upon creation
        },
      });

      return res.status(HttpStatus.CREATED).json({
        statusCode: HttpStatus.CREATED,
        message: "user was create successfully"
      });

    } catch (error) {

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('This username is already taken. Please choose another one.');
        }
      }

      this.logger.debug(hasMessage(error) ? error.message : "");
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * @brief This function handles user signin requests.
   * @param dto The data transfer object containing user information.
   * @param res The response object.
   * @return The result of the signin operation.
   */
  async signin(dto: AuthDto, res: Response, req: Request) {

    try {
      const user = await this.usersService.findUserWithUsername(dto.username);


      const passwordMatch = await argon.verify(user.hashPassword, dto.password);
      if (!passwordMatch)
        throw new UnauthorizedException('Incorrect password');

      const existingsessions = await this.findSessionsByUserId(user.id);
      if (existingsessions && existingsessions.length > 0) {
        // invalidate existing sessions
        await this.invalidateSessions(user.id);
      } 
      // Check if 2FA (Two-Factor Authentication) is enabled for the user
      await this.handleTwoFactorAuthentication(user, res);

    } catch (error) {
      this.logger.debug(error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────

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
      throw new HttpException('Failed to find or create refresh token for user' + (hasMessage(error) ? error.message : ''), HttpStatus.CONFLICT);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────

  // Method to invalidate all other sessions for a user except for the current session
  public async invalidateSessions(userId: number) {
    await this.prisma.session.updateMany({
      where: {
        userId: userId,
        isValid: true
      },
      data: {
        isValid: false, // Mark other sessions as invalid
        expiredAt: new Date() // Set the expiration timestamp to now
      },
    });
    console.log('Other sessions invalidated');
  }

  // ─────────────────────────────────────────────────────────────────────

  /**
      * Validates if a session is active and valid for a given user.
      * @param userId The ID of the user.
      * @param sessionId The ID of the session to validate.
      * @returns A boolean indicating whether the session is valid.
      */
  public async validateSession(userId: number, sessionId: string): Promise<boolean> {
    const session = await this.prisma.session.findFirst({
      where: {
        sessionId: sessionId,
        userId: userId,
        isValid: true, // Check if the session is marked as valid
        expiredAt: {
          gt: new Date() // Check if the session has not expired
        }
      },
    });

    return !!session; // Returns true if the session exists and is valid, false otherwise
  }

  // ─────────────────────────────────────────────────────────────────────

  /**
   * Creates a new session for a user.
   * @param userId The ID of the user for whom to create a session.
   * @param sessionDuration The duration (in milliseconds) for which the session is valid.
   * @returns The created session.
   */
  public async createNewSession(userId: number) { // Default duration: 24 hours
    const sessionId = this.generateUniqueSessionId(); // Implement this method to generate a unique session ID.
    const createdAt = new Date();
    const expiredAt = new Date(createdAt.getTime() + (15 * 60 * 1000)); //15 min as convention

    const session = await this.prisma.session.create({
      data: {
        userId: userId,
        sessionId: sessionId,
        createdAt: createdAt,
        expiredAt: expiredAt,
        isValid: true,
      },
    });

    return session;
  }

  // ─────────────────────────────────────────────────────────────────────────────

  private generateUniqueSessionId() {
    // Implement logic to generate a unique session ID
    // Example: using UUIDs
    return require('crypto').randomBytes(16).toString('hex');
  }

  // ─────────────────────────────────────────────────────────────────────────────

  /**
       * Finds all sessions associated with a given user ID.
       * @param userId The ID of the user.
       * @returns A list of sessions.
       */
  public async findSessionsByUserId(userId: number): Promise<Session[]> {
    return await this.prisma.session.findMany({
      where: {
        userId: userId,
        isValid: true, // Assuming you want to find only valid (active) sessions
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────



  /**
   * Generates JWT and refresh tokens for a user and updates session information in the database.
   * @param userId - The ID of the user.
   * @param email - The email of the user.
   * @returns An object containing the generated JWT and refresh tokens, along with their expiration information.
   */
  async generateTokens(userId: number, email: string): 
    Promise<{
      newToken: { token: string, expiresAt: Date },
      refreshToken: { token: string, expiresAt: Date },
      sessionCreation: any | null
    }> {

    let sessionCreationResponse: any | null = null;
    try {
      sessionCreationResponse = await this.createNewSession(userId);
    } catch (error) {
      throw new HttpException("Error updating user session in database: " + (hasMessage(error) ? error.message : ''), HttpStatus.CONFLICT);
    }
    let sessionId = sessionCreationResponse.sessionId;
    const payload = { sub: userId, email, sessionId};
    const secret = this.JWT_SECRET;
    const tokenExpiration = process.env.JWT_EXPIRATION || '15m';

    let token, tokenExpiresAt;
    try {
      token = await this.jwt.signAsync(payload, { expiresIn: tokenExpiration, secret });
      tokenExpiresAt = new Date(Date.now() + this.convertToMilliseconds(tokenExpiration));
    } catch (error) {
      throw new HttpException("Error generating JWT token: " + (hasMessage(error) ? error.message : ''), HttpStatus.CONFLICT);
    }

    let refreshToken;
    try {
      refreshToken = await this.refreshTokenIfNeeded(userId);
    } catch (error) {
      throw new HttpException("Error generating refresh token: " + (hasMessage(error) ? error.message : ''), HttpStatus.CONFLICT);
    }


    let newToken = { token, expiresAt: tokenExpiresAt }
    return { newToken, refreshToken, sessionCreation: sessionCreationResponse};
  }

  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Sets JWT and refresh tokens in HTTP-only cookies on the response object.
   * @param tokens - Object containing the JWT token and refresh token with their expiration times.
   * @param res - HTTP response object to set cookies on.
   */
  setTokens(tokens: {
    newToken: { token: string, expiresAt: Date },
    refreshToken: { token: string, expiresAt: Date },
    sessionCreation: any
  },
    res: Response) {
    try {
      // Error handling for undefined tokens
      if (!tokens || !tokens.newToken.token || !tokens.refreshToken || !tokens.refreshToken.token) {
        throw new ConflictException('Problem creating refresh token for user');
      }

      // Set refresh token cookie
      const refreshTokenMaxAge = tokens.refreshToken.expiresAt.getTime() - Date.now();
      res.cookie('refreshToken', tokens.refreshToken.token, {
        httpOnly: true,
        secure: false,
        sameSite: true,
        maxAge: refreshTokenMaxAge
      });

      // Assuming the JWT token also has an expiresAt property to calculate its maxAge
      const tokenMaxAge = tokens.newToken.expiresAt.getTime() - Date.now(); // tokens.newToken.tokenExpiresAt needs to be provided
      res.cookie('token', tokens.newToken.token, {
        httpOnly: true,
        secure: false,
        sameSite: true,
        maxAge: tokenMaxAge
      });

      res.cookie('userSession', tokens.sessionCreation.sessionId, {
        httpOnly: true,
        secure: false,
        sameSite: true,
        maxAge: tokenMaxAge
      });

    } catch (error) {
      throw error;
    }
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
    try {
      const { newToken, refreshToken, sessionCreation } = await this.generateTokens(userId, email);
      this.setTokens({ newToken, refreshToken, sessionCreation }, res);

      return ({ statusCode: 200, valid: true, message: "Authentication successful" });

    } catch (error) {
      this.logger.debug(`Fail to signToken ${hasMessage(error) ? error.message : ""}`);
      throw error;
    }
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
      this.logger.debug(`Failed to create refresh token for user ${userId}`, error);
      throw new HttpException("Error creating fresh token: " + (hasMessage(error) ? error.message : ''), HttpStatus.CONFLICT);
    }
  }


  // ─────────────────────────────────────────────────────────────────────────────
  //???????????????????????????????????????????????
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
      return res.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Token missing',
        error: 'NOT_FOUND'
      });

    try {

      jwt.verify(token, this.JWT_SECRET);
      return res.status(HttpStatus.OK).json({ statusCode: HttpStatus.OK, message: "Token valid" });

    } catch (error) {

      return res.status(HttpStatus.UNAUTHORIZED).json({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Invalid Token',
        error: 'UNAUTHORIZED'
      });

    }
  }

  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * @brief This function handles user signout requests.
   * @param decodedPayload The decoded payload.
   * @param res The response object.
   * @return The result of the signout operation.
   */
  async signout(userId: number, res: Response) {
    try {
      // this.logger.debug("passing by signout");
      // await this.prisma.user.update({
      //   where: { id: userId },
      //   data: { sessionId: null, sessionExpiresAt: null },
      // });

      // Clear the JWT cookie or session
      res.clearCookie('token');
      res.clearCookie('refreshToken');
      res.clearCookie('userSession');

      return res.status(HttpStatus.OK).json({ statusCode: HttpStatus.OK, message: 'Signed out successfully' });

    } catch (error) {

      this.logger.debug(error);
      return res.status(HttpStatus.UNAUTHORIZED).json({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Unable to signout',
        error: 'UNAUTHORIZED'
      });

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

      // Extract the 'code' from the query parameters
      const code = req.query['code'];

      // Exchange the code for a token
      const token = await this.exchangeCodeForToken(code);
      this.logger.debug(`signToken ${token}`);
      // Check if the token was successfully retrieved
      if (!token) {
        this.logger.debug('Failed to fetch access token');
        return res.status(HttpStatus.UNAUTHORIZED).json({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Failed to fetch access token',
          error: 'UNAUTHORIZED'
        });
      }

      // Retrieve user information using the token
      const userInfo = await this.getUserInfo(token);
      if (!userInfo) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Failed to fetch information from 42api',
          error: 'UNAUTHORIZED'
        });
      }

      // Create a new user or update existing user with the retrieved information
      const user = await this.createUser(userInfo, res);
      if (!user) {
        return res.status(HttpStatus.CONFLICT).json({
          statusCode: HttpStatus.CONFLICT,
          message: 'Unable to register in the game with 42 API',
          error: 'CONFLICT'
        });
      }

      const existingsessions = await this.findSessionsByUserId(user.id);
      if (existingsessions && existingsessions.length > 0) {
        // invalidate existing sessions
        await this.invalidateSessions(user.id);
      } 

      // Check if 2FA (Two-Factor Authentication) is enabled for the user
      await this.handleTwoFactorAuthentication(user, res);

    } catch (error) {
      // Log and handle any errors that occur during the process
      this.logger.debug('Error in signToken42:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────

  private async handleTwoFactorAuthentication(user: User, res: Response) {
    try {
      // Check if 2FA (Two-Factor Authentication) is enabled for the user
      if (await this.is2FaEnabled(user.id) === false) {
        // If 2FA is not enabled, proceed to sign the token
        const result = await this.signToken(user.id, user.username, res);
        // Validate the result of token signing
        if (!result.valid)
          throw new UnauthorizedException('Invalid credentials');
        // Send a successful response
        res.status(HttpStatus.OK).json({ valid: result.valid, message: result.message, userId: null });
      } else {
        // If 2FA is enabled, indicate that in the response
        res.status(HttpStatus.OK).json({ valid: true, message: "2FA", userId: user.id });
      }
    } catch (error) {
      throw error;
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
      this.logger.debug('Error fetching access token:', error);
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
        redirect_uri: process.env.CALLBACK_URL_42,
      };

      return axios.post('https://api.intra.42.fr/oauth/token', null, { params: requestBody });

    } catch (error) {
      this.logger.debug(`Error sending Authorization code in 42api Auth: ${error}`);
      throw new HttpException("Error sending Authorization code in 42api Auth: " + (hasMessage(error) ? error.message : ''), HttpStatus.CONFLICT);
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

      this.logger.debug('Error fetching user info in service getUserInfo:', error);
      return null;

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
  async createUser(userInfo: any, res: Response): Promise<User | null> {
    // Check if the user already exists in the database based on their ID.
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: {
          id: userInfo.id,
        },
      });

      if (existingUser) {
        // If the user already exists, log a message and update their 'firstConnexion' status.
        existingUser.firstConnexion = false;
        return existingUser;
      }

      let avatarUrl;
      if (userInfo.image.link !== null) {
        // Use the user's profile picture link if it's not null.
        avatarUrl = userInfo.image.link;
      }

      let avatarFile;
      try {
        // Download the user's avatar image.
        avatarFile = await this.usersService.downloadFile(avatarUrl);
      } catch (downloadError) {
        this.logger.debug('Error downloading user avatar:', downloadError);
        // Handle the error or assign a default avatar.
      }

      try {
        // Create a new user in the database with the provided user information.
        const user = await this.prisma.user.create({
          data: {
            id: userInfo.id,
            hashPassword: this.generateRandomPassword(),
            username: userInfo.login,
            avatar: null, // Initialize the avatar field with null for now.
          },
        });

        // Update the user's avatar using the downloaded image, if available.
        if (avatarFile) {
          await this.usersService.updateAvatar(user.id, avatarFile);
        }

        // Generate and store a two-factor authentication secret for the user.
        const { secret, otpauthUrl } = this.generateTwoFASecret(user.id);
        user.twoFASecret = secret;
        user.twoFAUrl = otpauthUrl;

        // Return the newly created user.
        return user;
      } catch (creationError) {
        // Handle any errors that occur during user creation.
        this.logger.debug('Error creating user:', creationError);
        return null;
      }
    } catch (error) {
      // Handle any other errors that occur in the function.
      this.logger.debug('Error in createUser function:', error);
      return null;
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
   * @param res The HTTP response object for sending responses.
   * @returns Whether the 2FA code is verified.
   */
  async verifyTwoFACode(userId: number, code: string, res: Response): Promise<any> {
    try {
      // Find the user in the database based on the provided userId
      const user: User | null = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        // If the user is not found, send a 'Not Found' response
        return res.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User not found',
          error: 'NOT_FOUND',
          res: false
        });
      }

      // Check if the user has a 2FA secret set up
      if (!user.twoFASecret) {
        // If the user's two-factor authentication secret is not found, return a 404 Not Found response.
        return res.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Secret code not found',
          error: 'NOT_FOUND',
          res: false
        });
      }

      // Verify the provided 2FA code using the user's 2FA secret
      const verified = speakeasy.totp.verify({
        secret: user.twoFASecret,
        encoding: 'base32',
        token: code,
      });


      if (verified === true) {
        // If the code is verified successfully, proceed with user authentication
        const result = await this.signToken(user.id, user.username, res);
        if (!result.valid) {
          // If authentication fails, send a 'Forbidden' response with details
          return res.status(HttpStatus.FORBIDDEN).json({
            statusCode: HttpStatus.FORBIDDEN,
            message: 'User is already logged in',
            error: 'FORBIDDEN',
            res: false
          });
        }
        // Send an 'OK' response with authentication details
        return res.status(HttpStatus.OK).json({ valid: result.valid, message: result.message, userId: null, res: true });
      }

      return verified;

    } catch (error) {
      // Handle any errors that may occur during the verification process and log them
      this.logger.debug(error);
      return false;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * @brief Validates two-factor authentication (2FA) for a user.
   *
   * This function checks if the provided 2FA code is valid for the user identified by the given userId.
   *
   * @param userId - The ID of the user to validate 2FA for.
   * @param code - The 2FA code to be verified.
   * @param res - The HTTP response object used for sending responses.
   *
   * @returns A JSON response indicating the result of 2FA validation.
   *   - If the user is not found, it returns a 404 Not Found response.
   *   - If the user's 2FA secret is not found, it returns a 404 Not Found response.
   *   - If the provided 2FA code is correct, it updates the user's TwoFA status to true and returns a 202 Accepted response.
   *   - If the provided 2FA code is incorrect, it returns a 401 Unauthorized response.
   */
  async validateTwoFA(userId: number, code: string, res: Response) {
    try {
      // Find the user in the database based on the provided user ID.
      const user: User | null = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        // If the user is not found, return a 404 Not Found response.
        return res.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User not found',
          error: 'NOT_FOUND',
          res: false
        });
      }

      const secret = user.twoFASecret;

      if (!secret) {
        // If the user's two-factor authentication secret is not found, return a 404 Not Found response.
        return res.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Secret code not found',
          error: 'NOT_FOUND',
          res: false
        });
      }

      // Verify the provided two-factor authentication code using the user's secret.
      const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token: code
      });

      if (verified === true) {
        // If the code is verified successfully, update the user's TwoFA status to true.
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            TwoFA: true,
          },
        });

        // Return a 202 Accepted response with a success message.
        return res.status(HttpStatus.ACCEPTED).json({
          statusCode: HttpStatus.ACCEPTED,
          message: 'The provided code was accepted',
          res: verified
        });
      }

      // If the code verification fails, return a 401 Unauthorized response.
      return res.status(HttpStatus.UNAUTHORIZED).json({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Incorrect code',
        error: 'UNAUTHORIZED',
        res: false
      });

    } catch (error) {
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * @brief This function enables Two-Factor Authentication (2FA) for a user.
   * @param userId The user's ID.
   * @param res The HTTP response object for sending responses.
   */
  async enable2FA(userId: number, res: Response): Promise<void> {
    try {
      // Check if the user with the given ID exists in the database
      const userExists = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!userExists) {
        // If the user is not found, send a 'Not Found' response
        res.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User not found',
          error: 'NOT_FOUND'
        });
        return;
      }

      // Generate a secret key and OTP (One-Time Password) URL for 2FA
      const { secret, otpauthUrl } = this.generateTwoFASecret(userId);

      // Update the user's information in the database to enable 2FA
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          TwoFA: false, // Set TwoFA to 'true' to enable 2FA for the user
          twoFASecret: secret, // Store the 2FA secret key in the user's record
        },
      });

      // Generate a QR code URL based on the OTP URL
      const QRUrl = await this.generateQR(otpauthUrl);
      if (QRUrl) {
        // If the QR code is generated successfully, send it as a response
        res.status(HttpStatus.OK).json({ qrcode: QRUrl });
      } else {
        // If there's an issue generating the QR code, send a 'Conflict' response
        res.status(HttpStatus.CONFLICT).json({
          statusCode: HttpStatus.CONFLICT,
          message: 'Unable to generate QR code',
          error: 'CONFLICT'
        });
      }
    } catch (error) {
      this.logger.debug('Internal Server Error occurred in enable2FA: ', error);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Generate a QR code image from an OTP URL.
   * @param otpauthUrl The OTP URL to generate the QR code for.
   * @returns A Promise that resolves to the QR code URL or null if there's an error.
   */
  private async generateQR(otpauthUrl: string): Promise<string | null> {
    try {
      // Generate a QR code image URL using the otpauthUrl
      const url = await QRCode.toDataURL(otpauthUrl);
      return url;
    } catch (err) {
      // Handle any errors that occur during QR code generation
      this.logger.debug('Error generating QR Code: ', err);
      return null;
    }
  }


  // ─────────────────────────────────────────────────────────────────────────────

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

  async is2FaEnabled(userid: number): Promise<boolean> {

    const user: User | null = await this.prisma.user.findUnique({
      where: {
        id: userid,
      },
    });

    if (!user)
      return false;

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