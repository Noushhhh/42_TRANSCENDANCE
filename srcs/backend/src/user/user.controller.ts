import {
    Controller,
    Post,
    Get,
    UseInterceptors,
    UploadedFile,
    Request as NestRequest,
    Response as NestResponse,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { UserService } from './user.service';
  import { Request, Response } from 'express';
  import { ExtractJwt } from '../auth/decorators/extract-jwt.decorator';
  import { DecodedPayload } from '../auth/interfaces/decoded-payload.interface';
  
  /**
  * ****************************************************************************
   * UserController class provides endpoints for user-related operations.
   * @class
  * ****************************************************************************
  */
  @Controller('user')
  export class UserController {
    /**
     * Constructor initializes the UserService.
     * @constructor
     * @param {UserService} userService - UserService instance.
     */
    constructor(private readonly userService: UserService) {}

  // ─────────────────────────────────────────────────────────────────────────────

  /**
  * ****************************************************************************
     * Updates the user's publicName and avatar.
     * @async
     * @post
     * @param {Express.Multer.File} profileImage - User's profile image.
     * @param {Request} req - Express request object.
     * @param {DecodedPayload | null} decodedPayload - Decoded JWT payload.
     * @param {Response} res - Express response object.
     * @returns {Promise<Response>} - Returns a promise that resolves with the response object.
  * ****************************************************************************
  */
    @Post('update')
    @UseInterceptors(FileInterceptor('profileImage'))
    async createOrUpdateProfile(
      @UploadedFile() profileImage: Express.Multer.File,
      @NestRequest() req: Request,
      @ExtractJwt() decodedPayload: DecodedPayload | null,
      @NestResponse() res: Response
    ): Promise<Response> {
      if (!decodedPayload) {
        console.error(
          'Unable to decode token in createOrUpdateProfile controller in user module\n'
        );
        return res
          .status(401)
          .json({ valid: false, message: 'Unable to decode token in usermodule' });
      }
  
      const { profileName } = req.body;
      const result = await this.userService.handleProfileSetup(
        decodedPayload,
        profileName,
        profileImage
      );
      return res
        .status(result.statusCode)
        .json({ valid: result.valid, message: result.message });
    }
 
    // ─────────────────────────────────────────────────────────────────────

  /**
  * ****************************************************************************
     * Checks if the client has already registered their publicName.
     * @async
     * @get
     * @param {DecodedPayload | null} decodedPayload - Decoded JWT payload.
     * @param {Response} res - Express response object.
     * @returns {Promise<Response>} - Returns a promise that resolves with the response object.
  * ****************************************************************************
  */
    @Get('isClientRegistered')
    async checkFirstConnection(
      @ExtractJwt() decodedPayload: DecodedPayload | null,
      @NestResponse() res: Response
    ): Promise<Response> {
      if (!decodedPayload) {
        console.error(
          'Unable to decode token in createOrUpdateProfile controller in user module\n'
        );
        return res
          .status(401)
          .json({ valid: false, message: 'Unable to decode token in usermodule' });
      }
      const result = await this.userService.isClientRegistered(decodedPayload);
      return res
        .status(result.statusCode)
        .json({ valid: result.valid, message: result.message });
    }
  }