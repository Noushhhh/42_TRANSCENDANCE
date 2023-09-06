import { Injectable } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';
import * as jwt from 'jsonwebtoken'
import { ColdObservable } from 'rxjs/internal/testing/ColdObservable';
import { retry } from 'rxjs';

@Injectable()
export class UserService {
    private JWT_SECRET: string | any; 
    constructor(
        private readonly prisma: PrismaService,
        private readonly cloudinaryService: CloudinaryService
    ) { 
        this.JWT_SECRET = process.env.JWT_SECRET;

        if (!this.JWT_SECRET) {
            throw new Error("JWT_SECRET environment variable not set!");
        }
 }

    async handleProfileSetup(userCookie: string, profileName: string, profileImage: any): Promise<any> {
        // Decode the token to get user's info
        console.log("passing by beginning handleProfileSetup\n");
        console.log(userCookie + "\n");
        console.log(this.JWT_SECRET + "\n");
        let decodedToken;
        try {
            decodedToken = jwt.verify(userCookie, this.JWT_SECRET);
        } catch (error) {
            throw new Error('Invalid token.');
        }
        let resultEmail : string | undefined;

        if (typeof decodedToken === 'object' && decodedToken !== null) {
            resultEmail = decodedToken.email;
        } else {
            throw new Error('Invalid token format backend(handleProfileSetup).\n');
        }
        // Fetch user from the database
        const user = await this.prisma.user.findUnique({ where: { username: resultEmail} });
        if (!user) {
            throw new Error('User not found.');
        }

        console.log(user);
        console.log(profileImage);
        // Upload image to Cloudinary
        // const result = await this.cloudinaryService.uploadImage(profileImage)

        // Check if the user already has a profile set up. If yes, update; if no, create.
        // const userProfile = await this.prisma.user.update({
        //     where: { id: userId },
        //     data: {
        //         username: profileName, // assuming this maps to the username column in your Prisma model
        //         profileImageUrl: result, // URL from Cloudinary
        //     },
        // });

        // return userProfile;
    }
}