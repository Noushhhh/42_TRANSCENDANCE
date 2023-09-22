import {
    Controller, Post, Get, UseInterceptors, UploadedFile,
    Request as NestRequest, Response as NestResponse
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { Request , Response } from 'express';
import { ExtractJwt } from '../auth/decorators/extract-jwt.decorator';
import { DecodedPayload } from '../auth/interfaces/decoded-payload.interface';

@Controller('user')
export class UserController {
    
    constructor(private readonly userService: UserService) {}

    @Post('update')
    @UseInterceptors(FileInterceptor('profileImage'))
    async createOrUpdateProfile(@UploadedFile() profileImage: Express.Multer.File, @NestRequest() req: Request,
        @ExtractJwt() decodedPayload: DecodedPayload | null, @NestResponse() res : Response) {

        if (!decodedPayload)
        {
            console.error('Unable to decode token in createOrUpdateProfile controller in user module\n');
            return res.status(401).json({valid:false , message: "Unable to decode token in usermodule"});
        }

        const { profileName } = req.body;
        // const userCookie = req.cookies['token'];
        console.log("passing by user controller" + `\n decoded email: ${decodedPayload.email} \n profile name : ${profileName}\n`);
        const result = await this.userService.handleProfileSetup(decodedPayload, profileName, profileImage);
        return res.status(result?.statusCode).json({valid: result.valid, message: result.message});
    }

}
