import {
    Controller, Get, UseGuards, Req, Post,
    Put, UseInterceptors, UploadedFile,
    Request as NestRequest,
    Response as NestResponse, Body, Query,
} from '@nestjs/common'
import { Prisma, User } from '@prisma/client';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt.auth-guard';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExtractJwt } from '../decorators/extract-jwt.decorator';
import { DecodedPayload } from '../interfaces/decoded-payload.interface';
import * as fs from 'fs';
import { UserProfileData } from '../interfaces/user.interface';
import { PassportSerializer } from '@nestjs/passport';

@Controller('users')
export class UsersController {
    constructor(
        private UsersService: UsersService
    ) { };

    // ─────────────────────────────────────────────────────────────────────────────

    checkDecodedPayload(decodedPayload: DecodedPayload | null, @NestResponse() res: Response, message: string): boolean {
        // Check if the decoded payload is valid
        if (!decodedPayload) {
            console.error(
                'Unable to decode token in  controller in user module\n'
            );
            res.status(401).json({ statusCode: 401, valid: false, message: message });
            return false;
        }
        return true;
    }

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

        this.checkDecodedPayload(decodedPayload, res, "Unable to decode token in \
      user module, createOrUpdateProfile controller\n");

        const { profileName } = req.body;
        const result = await this.UsersService.handleProfileSetup(
            decodedPayload,
            profileName,
            profileImage
        );
        return res
            .status(result.statusCode)
            .json({ statusCode: result.statusCode, valid: result.valid, message: result.message });
    }

    // ─────────────────────────────────────────────────────────────────────────────

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
                'Unable to decode token in isClientRegistered controller in user module\n'
            );
            return res
                .status(401)
                .json({ statusCode: 404, valid: false, message: 'Unable to decode token in usermodule' });
        }
        const result = await this.UsersService.isClientRegistered(decodedPayload);
        return res
            .status(result.statusCode)
            .json({ statusCode: result.statusCode, valid: result.valid, message: result.message });
    }

    // ─────────────────────────────────────────────────────────────────────────────

    /**
    * ****************************************************************************
     * @brief Get the user's avatar
     * @param decodedPayload The decoded JWT payload
     * @param res The response object
     * @returns The user's avatar as a stream, or an error message with the appropriate status code
    * ****************************************************************************
     */
    @Get('getavatar')
    async getUserAvatar(
        @ExtractJwt() decodedPayload: DecodedPayload,
        @NestResponse() res: Response
    ) {
        this.checkDecodedPayload(decodedPayload, res, "Unable to decode token in user \
      module getUserAvatar controller" )

        // Get the user profile using the decoded payload's subject
        const user = await this.UsersService.getUserData(decodedPayload.sub);
        if (!user) {
            return (res.status(404).send({ statusCode: 404, valid: false, message: "User doesn't exist\n" }));
        }
        if (user.avatar) {

            // Create a read stream for the avatar file
            const stream = fs.createReadStream(user.avatar);

            // Handle stream errors
            stream.on('error', (error) => {
                console.error('Error reading avatar file:', error);
                res.status(500).send('Error reading avatar file');
            });
            // Pipe the stream to the response
            stream.pipe(res);
        } else {
            // If the user doesn't have an avatar, return a 404 status
            return (res.status(404).send({ statusCode: 404, message: "Avatar not found" }));
        }
    }

    // ─────────────────────────────────────────────────────────────────────

    @Get('getprofilename')
    async getProfileName(@ExtractJwt() decodedPayload: DecodedPayload,
        @NestResponse() res: Response) {
        // Check if the decoded payload is valid
        const isPayloadDecoded: boolean = this.checkDecodedPayload(decodedPayload, res, "unable to decode token in user \
      module getProfileName controller" );
        if (!isPayloadDecoded)
            return;
        try {
            const user = await this.FindWithId(decodedPayload.sub);
            return res.status(200).send({
                valid: true, message: "profileName found",
                profileName: user?.publicName
            }
            );

        } catch (error) {
            throw error;
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    @Put('updatepublicname')
    async updatePublicName(@ExtractJwt() decodedPayload: DecodedPayload,
        @NestResponse() res: Response, @Query('username') publicName: string) {
        const isPayloadDecoded: boolean = this.checkDecodedPayload(decodedPayload, res, "unable to decode token in user" +
            "module, updatePublicName controller");
        if (!isPayloadDecoded)
            return;
        try {
            const result = await this.UsersService.updatePublicName(decodedPayload.sub, publicName);
            res.status(result?.statusCode || 500).send({ valid: result?.valid || false, message: result?.message })
        } catch (error) {
            throw error;
        }
    }

// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

    @Put('updateavatar')
    @UseInterceptors(FileInterceptor('avatar'))
    async updateAvatar(
        @ExtractJwt() decodedPayload: DecodedPayload | null,
        @UploadedFile() avatar: Express.Multer.File, @NestResponse() res: Response) {
        const isPayloadDecoded: boolean = this.checkDecodedPayload(decodedPayload, res,
            "Error decoding payload in updateAvatar controller, user module");
        if (!isPayloadDecoded)
            return;
        const userId: number | undefined = decodedPayload?.sub;
        try {
            await this.UsersService.updateAvatar(userId, avatar);
            res.status(200).send({ statusCode: 200, valid: true, message: "Avatar was successfully updated" });
        } catch (error) {
            res.status(500).send({ statusCode: 500, valid: false, message: error });
        }
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────────────────────


    @UseGuards(JwtAuthGuard)
    @Get('me')
    getMe(@Req() req: Request) {
        return req.user;
    }

    @Get('UserWithId')
    FindWithId(userId: number): Promise<User | undefined> {
        return this.UsersService.findUserWithId(userId);
    }

    @Get('UserWithUsername')
    FindWithUsername(username: string): Promise<User | undefined> {
        return this.UsersService.findUserWithUsername(username);
    }
}
