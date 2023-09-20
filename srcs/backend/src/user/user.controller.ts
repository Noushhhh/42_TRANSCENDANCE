import { Controller, Post, UseInterceptors, UploadedFile, Request as NestRequest } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { Request as ExpressRequest } from 'express';

@Controller('user')
export class UserController {
    
    constructor(private readonly userService: UserService) {}

    @Post('update')
    @UseInterceptors(FileInterceptor('profileImage'))
    async createOrUpdateProfile(@UploadedFile() profileImage: Express.Multer.File, @NestRequest() req: ExpressRequest) {
        const { profileName } = req.body;
        const userCookie = req.cookies['token'];
        console.log("passing by user controller" + `\n token from cookies: ${userCookie} \n profile name : ${profileName}\n`);
        return this.userService.handleProfileSetup(userCookie, profileName, profileImage);
    }
}
