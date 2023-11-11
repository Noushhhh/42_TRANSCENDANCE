// NestJS and related imports
import {
    Controller, Get, Post, Put, Query,
    UseGuards, UseInterceptors, UploadedFile,
    UseFilters, Req, Request as NestRequest,
    Response as NestResponse, UnauthorizedException,
    NotFoundException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

// Local imports from within the project
import { AllExceptionsFilter } from '../auth/exception/all-exception.filter';
import { JwtAuthGuard } from '../auth/guards/jwt.auth-guard';
import { UsersService } from './users.service';
import { UserIdDto } from './dto';
import { ExtractJwt } from '../decorators/extract-jwt.decorator';
import { DecodedPayload } from '../interfaces/decoded-payload.interface';
import { Response } from 'express';

// External libraries or utilities
import { User } from '@prisma/client';


@UseFilters(AllExceptionsFilter)
@Controller('users') 
export class   UsersController {
    constructor(
        private   UsersService:UsersService 
    ) {  };

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
    ): Promise<any> {
        try {
            const result = await this.UsersService.isClientRegistered(decodedPayload);
            return res
                .status(result.statusCode)
                .json({ statusCode: result.statusCode, valid: result.valid, message: result.message });

        } catch (error) {
            throw new UnauthorizedException(error);
        }
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
        try {
            await this.UsersService.getUserAvatar(decodedPayload, res)
        } catch (error) {
            throw error;
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


    // @UseGuards(JwtAuthGuard)
    // @Get('me')
    // getMe(@Req() req: Request) {
    //     return req.user;
    // }

    @Get('UserWithId')
    FindWithId(userId: number): Promise<User>{
        return this.UsersService.findUserWithId(userId);
    }

    @Get('getUsernameWithId')
    getUsernameWithId(
        @Query() dto: UserIdDto): Promise<string>{
        return this.UsersService.getUsernameWithId(dto.userId);
    }
    
    @Get('UserWithUsername')
    FindWithUsername(username: string): Promise<User | undefined> {
        return this.UsersService.findUserWithUsername(username);
    }
}
