// NestJS and related imports
import {
    Controller, Get, UseGuards, Req, Post,
    Put, UseInterceptors, UploadedFile,
    Request as NestRequest,
    Response as NestResponse, Query, UseFilters, Body, BadRequestException
} from '@nestjs/common'
import { Prisma, User } from '@prisma/client';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt.auth-guard';
import { UsersService } from './users.service';
import { UserIdDto, friendRequestDto, UpdatePublicNameDto } from './dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExtractJwt } from '../decorators/extract-jwt.decorator';
import { DecodedPayload } from '../interfaces/decoded-payload.interface';
import { AllExceptionsFilter } from '../auth/exception/all-exception.filter';
import { UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';



@UseFilters(AllExceptionsFilter)
@UseGuards(JwtAuthGuard) // Ensure the user is authenticated
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
    async getUserInfo( @ExtractJwt() decodedPayload: DecodedPayload)
    {
        return decodedPayload;
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

            // For unknown errors, throw a generic internal server error
            throw new HttpException(
                'An error occurred while updating the public name.',
                HttpStatus.INTERNAL_SERVER_ERROR
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
            res.status(500).send({ statusCode: 500, valid: false, message: error });
            throw error;
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
    FindWithId(userId: number): Promise<User> {
        return this.UsersService.findUserWithId(userId);
    }

    @Get('getUsernameWithId')
    getUsernameWithId(
        @Query() dto: UserIdDto): Promise<string> {
        return this.UsersService.getUsernameWithId(dto.userId);
    }

    @Get('UserWithUsername')
    FindWithUsername(username: string): Promise<User | undefined> {
        return this.UsersService.findUserWithUsername(username);
    }

    @Post('sendFriendRequest')
    async sendFriendRequest(@Body() friendRequestDto: friendRequestDto) {
        try {
            await this.UsersService.sendFriendRequest(friendRequestDto.senderId, friendRequestDto.targetId);
        } catch (error) {
            console.log(error);
            throw error;
        }
        return { status: "Friend request sent" };
    }

    @Get('getPendingRequests')
    async getPendingRequests(@Req() req: Request) {
        const userId = req.headers['x-user-id'];
        if (typeof userId === 'string') {
            const userIdInt = parseInt(userId);
            const pendingRequests = await this.UsersService.getPendingRequests(userIdInt);

            return { pendingRequests: pendingRequests };
        }
        throw new BadRequestException("Error trying to parse userID");
    }

    @Post('acceptFriendRequest')
    async acceptFriendRequest(@Body() friendRequestDto: friendRequestDto) {
        try {
            await this.UsersService.acceptFriendRequest(friendRequestDto.senderId, friendRequestDto.targetId)
        } catch (error) {
            console.log(error);
            throw error;
        }

        return { status: "Friend request accepted" }
    }

    @Post('refuseFriendRequest')
    async refuseFriendRequest(@Body() friendRequestDto: friendRequestDto) {
        try {
            await this.UsersService.refuseFriendRequest(friendRequestDto.senderId, friendRequestDto.targetId)
        } catch (error) {
            console.log(error);
            throw error;
        }

        return { status: "Friend request refused" }
    }

    @Get('getFriendsList')
    async getFriendsList(@Req() req: Request) {
        const userId = req.headers['x-user-id'];
        if (typeof userId === 'string') {
            const userIdInt = parseInt(userId);

            const friendsList = await this.UsersService.getFriendsList(userIdInt);
            return { friendsList: friendsList };
        }
        throw new BadRequestException("Error trying to parse userID");
    }

    @Post('removeFriend')
    async removeFriend(@Body() friendRequestDto: friendRequestDto) {
        try {
            await this.UsersService.removeFriend(friendRequestDto.senderId, friendRequestDto.targetId);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    @Get('getUserProfil')
    async getUserProfil(@Req() req: Request) {
        const userId = req.headers['x-user-id'];

        if (typeof userId === 'string') {
            const userIdInt = parseInt(userId);

            const userProfile = await this.UsersService.getUserProfile(userIdInt);
            console.log("USER PROFILE = ", userProfile);
            return { userProfile: userProfile };
        }
        throw new BadRequestException("Error trying to parse userID");
    }
}
