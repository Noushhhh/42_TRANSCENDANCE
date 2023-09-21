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
        // return this.userService.handleProfileSetup(decodedToken, profileName, profileImage);
        return res.status(200).json({valid: true, message: "Decorator is working propertly\n"});
    }

    @Get('checkToken')
    async checkToken(req: Request)
    {
        console.log("passing by controller checkToken in user module\n" );
        const tokenCookie = req.cookies['token'];
        return this.userService.decodeToken(tokenCookie);
    }
}
