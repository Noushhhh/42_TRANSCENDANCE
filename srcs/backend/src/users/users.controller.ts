// NestJS and related imports
import {
    Controller, Get, UseGuards, Req, Post,
    Put, UseInterceptors, UploadedFile,
    Request as NestRequest,
    Response as NestResponse, Query, UseFilters, Body, BadRequestException, NotFoundException, Res, Logger, ForbiddenException,
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
    private readonly logger = new Logger(UsersController.name);
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
            this.logger.debug(error);
            throw error;
        }
    }

    // ─────────────────────────────────────────────────────────────────────

    @Get('getprofilename')
    async getProfileName(@ExtractJwt() decodedPayload: DecodedPayload,
        @NestResponse() res: Response) {
        // Check if the decoded payload is valid
        try {
            const user = await this.UsersService.findUserWithId(decodedPayload.sub);
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
                throw new HttpException(result.message, HttpStatus.CONFLICT);
            }

            return result; // Return the result directly
        } catch (error) {
            throw error;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────────────────────

    @Put('updateavatar')
    @UseInterceptors(FileInterceptor('avatar'))
    async updateAvatar(
        @ExtractJwt() decodedPayload: DecodedPayload,
        @UploadedFile() avatar: Express.Multer.File, @NestResponse() res: Response) {
        try {
            await this.UsersService.updateAvatar(decodedPayload.sub, avatar);
            res.status(HttpStatus.OK).send({ statusCode: 200, valid: true, message: "Avatar was successfully updated" });
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

    @Post('sendFriendRequest')
    async sendFriendRequest(@Req() req: Request, @Res() res: Response, @Body() friend: friendDto) {
        try {
            if (!req.user?.id)
                throw new NotFoundException("User not found");

            await this.UsersService.sendFriendRequest(req.user.id, friend.id);
            res.status(HttpStatus.OK).json({ statusCode: HttpStatus.OK })
        } catch (error) {
            res.status(HttpStatus.NOT_FOUND).json({ statusCode: HttpStatus.NOT_FOUND, message: "User not found", error: "Not Found" });
        }
    }

    @Get('getPendingRequests')
    async getPendingRequests(@Req() req: Request, @Res() res: Response) {
        try {
            if (!req.user?.id)
                throw new NotFoundException("User not found");

            const pendingRequests = await this.UsersService.getPendingRequests(req.user.id);
            res.status(HttpStatus.OK).json({ statusCode: HttpStatus.OK, pendingRequests: pendingRequests })
        } catch (error) {
            res.status(HttpStatus.NOT_FOUND).json({ statusCode: HttpStatus.NOT_FOUND, message: "User not found", error: "Not Found" });
        }
    }

    @Post('acceptFriendRequest')
    async acceptFriendRequest(@Req() req: Request, @Res() res: Response, @Body() friend: friendDto) {
        try {
            if (!req.user?.id)
                throw new NotFoundException("User not found");
            await this.UsersService.acceptFriendRequest(req.user.id, friend.id)
            res.status(HttpStatus.OK).json({ statusCode: HttpStatus.OK })
        } catch (error) {
            res.status(HttpStatus.NOT_FOUND).json({ statusCode: HttpStatus.NOT_FOUND, message: "User not found!§§§", error: "Not Found" });
        }
    }

    @Post('refuseFriendRequest')
    async refuseFriendRequest(@Req() req: Request, @Res() res: Response, @Body() friend: friendDto) {
        try {
            if (!req.user?.id)
                throw new NotFoundException("User not found");

            await this.UsersService.refuseFriendRequest(req.user.id, friend.id)
            res.status(HttpStatus.OK).json({ statusCode: HttpStatus.OK })
        } catch (error) {
            res.status(HttpStatus.NOT_FOUND).json({ statusCode: HttpStatus.NOT_FOUND, message: "User not found", error: "Not Found" });
        }
    }

    @Get('getFriendsList')
    async getFriendsList(@Req() req: Request, @Res() res: Response) {
        try {
            if (!req.user?.id)
                throw new NotFoundException("User not found");

            const friendsList = await this.UsersService.getFriendsList(req.user.id);
            res.status(HttpStatus.OK).json({ statusCode: HttpStatus.OK, friendsList: friendsList })
        } catch (error) {
            res.status(HttpStatus.NOT_FOUND).json({ statusCode: HttpStatus.NOT_FOUND, message: "User not found", error: "Not Found" });
        }
    }

    @Post('removeFriend')
    async removeFriend(@Req() req: Request, @Res() res: Response, @Body() friend: friendDto) {

        try {
            if (!req.user?.id)
                throw new NotFoundException("User not found");
            await this.UsersService.removeFriend(req.user.id, friend.id);
            res.status(HttpStatus.OK).json({ statusCode: HttpStatus.OK });
        } catch (error) {
            res.status(HttpStatus.NOT_FOUND).json({ statusCode: HttpStatus.NOT_FOUND, message: "User not found", error: "Not Found" });
        }
    }

    @Get('getUserProfil')
    async getUserProfil(@Req() req: Request, @Res() res: Response) {
        try {
            const userId = req.headers['x-user-id'];
            if (typeof userId === "string") {
                const intUserId = Number(userId);
                const userProfile = await this.UsersService.getUserProfile(intUserId);
                res.status(HttpStatus.OK).json({ statusCode: HttpStatus.OK, userProfile: userProfile });
            }
        } catch (error) {
            res.status(HttpStatus.NOT_FOUND).json({ statusCode: HttpStatus.NOT_FOUND, message: "User not found", error: "Not Found" });
        }
    }

    @Get('getUsersWithStr')
    async getUsersWithStr(@Req() req: Request, @Res() res: Response) {
        try {
            if (!req.user?.id)
                throw new NotFoundException("User not found");

            const toSearch = req.headers['x-search-header']!.toString();
            const users = await this.UsersService.getUsersWithStr(req.user.id, toSearch);
            res.status(HttpStatus.OK).json({ statusCode: HttpStatus.OK, usersFound: users })
        } catch (error) {
            res.status(HttpStatus.NOT_FOUND).json({ statusCode: HttpStatus.NOT_FOUND, message: "User not found", error: "Not Found" });
        }
    }
}
