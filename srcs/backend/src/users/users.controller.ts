// NestJS and related imports
import {
    Controller, Get, UseGuards, Req, Post,
    Put, UseInterceptors, UploadedFile,
    Request as NestRequest,
    Response as NestResponse, Query, UseFilters, Body, BadRequestException, NotFoundException
} from '@nestjs/common'
import { Prisma, User } from '@prisma/client';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt.auth-guard';
import { UsersService } from './users.service';
import { UserIdDto, friendRequestDto, UpdatePublicNameDto, friendDto } from './dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExtractJwt } from '../decorators/extract-jwt.decorator';
import { DecodedPayload } from '../interfaces/decoded-payload.interface';
import { UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';



@UseGuards(JwtAuthGuard) // Ensure the user is authenticated
@Controller('users')
export class UsersController {
    constructor(
        private UsersService: UsersService
    ) { };

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

    @Get('getUserInfo')
    async getUserInfo(@ExtractJwt() decodedPayload: DecodedPayload) {
        return await this.UsersService.getUserData(decodedPayload.sub);
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
            return await this.UsersService.getUserAvatar(decodedPayload, res)
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    // ─────────────────────────────────────────────────────────────────────

    @Get('getprofilename')
    async getProfileName(@ExtractJwt() decodedPayload: DecodedPayload,
        @NestResponse() res: Response) {
        // Check if the decoded payload is valid
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
    async updatePublicName(
        @ExtractJwt() decodedPayload: DecodedPayload,
        @Body() updatePublicNameDto: UpdatePublicNameDto
    ) {
        // Extract the publicName from the DTO
        const { publicName } = updatePublicNameDto;

        try {
            // Use decodedPayload.sub as the user identifier
            const result = await this.UsersService.updatePublicName(decodedPayload.sub, publicName);

            if (!result.valid) {
                throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
            }

            return result; // Return the result directly
        } catch (error) {
            // If it's a known error, rethrow it
            if (error instanceof Error) {
                throw error;
            }

            // For unknown errors, throw a generic
            throw new HttpException(
                'An error occurred while updating the public name.',
                HttpStatus.BAD_REQUEST
            );
        }
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────────────────────

    @Put('updateavatar')
    @UseInterceptors(FileInterceptor('avatar'))
    async updateAvatar(
        @ExtractJwt() decodedPayload: DecodedPayload | null,
        @UploadedFile() avatar: Express.Multer.File, @NestResponse() res: Response) {
        try {
            await this.UsersService.updateAvatar(decodedPayload?.sub, avatar);
            res.status(200).send({ statusCode: 200, valid: true, message: "Avatar was successfully updated" });
        } catch (error) {

            throw error;
        }
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────────────────────


    @Get('me')
    getMe(@Req() req: Request) {
        return req.user;
    }

    @Get('UserWithId')
    FindWithId(userId: number): Promise<User> {
        return this.UsersService.findUserWithId(userId);
    }

    @Get('getUsernameWithId')
    getUsernameWithId(
        @Query() dto: UserIdDto): Promise<string> {
        return this.UsersService.getUsernameWithId(dto.userId);
    }

    @Get('getPublicName')
    getPublicName(
        @Query() dto: UserIdDto): Promise<string | null> {
        return this.UsersService.getPublicName(dto.userId);
    }


    @Get('UserWithUsername')
    FindWithUsername(username: string): Promise<User | undefined> {
        console.log("controller: username is: ", username);
        return this.UsersService.findUserWithUsername(username);
    }

    @Post('sendFriendRequest')
    async sendFriendRequest(@Req() req: Request, @Body() friend: friendDto) {
        if (!req.user?.id)
            throw new NotFoundException("User not found");

        try {
            await this.UsersService.sendFriendRequest(req.user.id, friend.id);
        } catch (error) {
            console.error(error);
            throw error;
        }
        return { status: "Friend request sent" };
    }

    @Get('getPendingRequests')
    async getPendingRequests(@Req() req: Request) {
        if (!req.user?.id)
            throw new NotFoundException("User not found");
        const pendingRequests = await this.UsersService.getPendingRequests(req.user.id);

        return { pendingRequests: pendingRequests };

    }

    @Post('acceptFriendRequest')
    async acceptFriendRequest(@Req() req: Request, @Body() friend: friendDto) {
        if (!req.user?.id)
            throw new NotFoundException("User not found");
        try {
            await this.UsersService.acceptFriendRequest(req.user.id, friend.id)
        } catch (error) {
            console.error(error);
            throw error;
        }

        return { status: "Friend request accepted" }
    }

    @Post('refuseFriendRequest')
    async refuseFriendRequest(@Req() req: Request, @Body() friend: friendDto) {
        if (!req.user?.id)
            throw new NotFoundException("User not found");
        try {
            await this.UsersService.refuseFriendRequest(req.user.id, friend.id)
        } catch (error) {
            console.error(error);
            throw error;
        }

        return { status: "Friend request refused" }
    }

    @Get('getFriendsList')
    async getFriendsList(@Req() req: Request) {
        if (!req.user?.id)
            throw new NotFoundException("User not found");

        const friendsList = await this.UsersService.getFriendsList(req.user.id);
        return { friendsList: friendsList };
    }

    @Post('removeFriend')
    async removeFriend(@Req() req: Request, @Body() friend: friendDto) {
        if (!req.user?.id)
            throw new NotFoundException("User not found");

        try {
            await this.UsersService.removeFriend(req.user.id, friend.id);
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    @Get('getUserProfil')
    async getUserProfil(@Req() req: Request) {
        if (!req.user?.id)
            throw new NotFoundException("User not found");
        try {
            const userProfile = await this.UsersService.getUserProfile(req.user.id);
            return { userProfile: userProfile };
        } catch (error) {
            console.error(error)
            throw error;
        }
    }
}
