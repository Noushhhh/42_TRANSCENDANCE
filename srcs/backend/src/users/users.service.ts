import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException, UseFilters } from "@nestjs/common";
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { DecodedPayload } from '../interfaces/decoded-payload.interface';
import { UserProfileData } from '../interfaces/user.interface';
import multer from 'multer';


@Injectable()
export class UsersService {
    // Declare private variables for JWT secret and upload folder path
    private JWT_SECRET: string | any;
    private readonly uploadFolder = 'uploads';

    constructor(private readonly prisma: PrismaService) {
        this.JWT_SECRET = process.env.JWT_SECRET;

        // Check if JWT_SECRET is set, otherwise throw an error
        if (!this.JWT_SECRET) {
            throw new Error('JWT_SECRET environment variable not set!');
        }
    }

    // ─────────────────────────────────────────────────────────────────────────────


    /**
    * ****************************************************************************
     * Checks if a user has been already registered.
     * @async
     * @param {DecodedPayload | null} payload - Decoded JWT payload.
     * @returns {Promise<any>} - Returns an object with registration status and message.
     * 
    * ****************************************************************************
    */

    async isClientRegistered(payload: DecodedPayload | null): Promise<any> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { username: payload?.email },
            });

            if (!user?.firstConnexion) {
                return {
                    statusCode: 200,
                    valid: true,
                    message: 'Client already registered',
                };
            } else {
                return {
                    statusCode: 404,
                    valid: false,
                    message: 'Client is not registered yet',
                };
            }
        } catch (error) {
            console.error(`Passing by isClientRegistered ${error}`);
            return { statusCode: 401, valid: false, message: error };
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Handles profile setup for a user.
     * @async
     * @param {DecodedPayload | null} payload - Decoded JWT payload.
     * @param {string} profileName - User's profile name.
     * @param {any} profileImage - User's profile image.
     * @returns {Promise<any>} - Returns an object with profile setup status and message.
     */
    async handleProfileSetup(
        payload: DecodedPayload | null,
        profileName: string,
        profileImage: any
    ): Promise<any> {
        // Declare a variable to store the decoded JWT token
        const emailFromCookies = payload?.email;

        const registeredUser: any = await this.prisma.user.findUnique({
            where: { publicName: profileName },
        });

        if (registeredUser) {
            return {
                statusCode: 409,
                valid: false,
                message: 'Username already exists',
            };
        }

        // Fetch the user from the database using the PrismaService and the email from the decoded token
        const user = await this.prisma.user.findUnique({
            where: { username: emailFromCookies },
        });

        // Check if the user exists, otherwise throw an error
        if (!user) {
            return {
                statusCode: 404,
                valid: false,
                message: 'username not found',
            };
        }

        // Get the file extension of the profile image
        const fileExtension = extname(profileImage.originalname);

        // Generate a unique filename using uuidv4 and the file extension
        const uniqueFilename = uuidv4() + fileExtension;

        // Construct the file path for the profile image in the upload folder
        const filePath = `${this.uploadFolder}/${uniqueFilename}`;

        // Save the profile image to the local folder using the saveImageToLocalFolder method
        try {
            await this.saveImageToLocalFolder(profileImage, filePath);
        } catch (error) {
            console.error(error);
            return { statusCode: 400, valid: false, message: error };
        }

        // Update the user profile in the database using the PrismaService
        try {
            await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    publicName: profileName,
                    avatar: filePath,
                    firstConnexion: false,
                },
            });

            // Return the updated user profile
            return {
                statusCode: 200,
                valid: true,
                message: 'Profile was successfully updated',
            };
        } catch (error) {
            return { statusCode: 400, valid: false, message: error };
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────────────

    /**
    * ****************************************************************************
     * Saves an image to the local folder.
     * @async
     * @private
     * @param {Express.Multer.File} file - Image file to be saved.
     * @param {string} filePath - File path where the image will be saved.
     * @returns {Promise<void>} - Returns a promise that resolves when the image is saved.
    * ****************************************************************************
    */
    private async saveImageToLocalFolder(
        file: Express.Multer.File,
        filePath: string
    ): Promise<void> {
        try {
            // Import the 'fs' module to work with the file system
            const fs = require('fs');

            // Create a write stream to write the file buffer to the specified file path
            const writeStream = fs.createWriteStream(filePath);

            // Write the file buffer to the write stream
            writeStream.write(file.buffer);

            // End the write stream
            writeStream.end();
        } catch (error) {
            throw error;
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────────────

    async getUserData(id: number): Promise<UserProfileData | null> {
        const user = await this.prisma.user.findUnique({
            where: { id: id },
            select: {
                publicName: true,
                avatar: true,
                firstConnexion: true,

            },
        });

        return user;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────────────────────

    async updatePublicName(userId: number, publicName: string) {

        const user = await this.prisma.user.findUnique({
            where: { publicName: publicName },
            select: {
                id: true,
                username: true,
                publicName: true,
            },
        });

        if (user && user?.id !== userId)
            throw new ForbiddenException("User already taken, take another one");
        try {
            await this.prisma.user.update({
                where: { id: userId },
                data: {
                    publicName: publicName,
                    firstConnexion: false
                },
                
            });
            return ({
                statusCode: 200,
                valid: true,
                message: "User name was updated successfully",
            });
        } catch (error) {
            throw new NotFoundException("There was an error updating public name");
        }
    }

// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

    async updateAvatar(userId: number | undefined, avatar: Express.Multer.File) {
        try {
            const uniqueFilename = uuidv4() + extname(avatar.originalname);
            const filePath = `${this.uploadFolder}/${uniqueFilename}`;

            try {
                await this.saveImageToLocalFolder(avatar, filePath);
            } catch (error) {
                console.error('Error saving image to local folder:', error);
                throw new Error('Failed to save image to local folder');
            }

            try {
                await this.prisma.user.update({
                    where: { id: userId },
                    data: { avatar: filePath },
                });
            } catch (error) {
                console.error('Error updating user avatar in database:', error);
                throw new Error('Failed to update user avatar in database');
            }

        } catch (error) {
            console.error('Error in updateAvatar service:', error);
            throw error;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────────────────────


    async validateUser(username: string): Promise<any> {
        const user = await this.findUserWithUsername(username);
        if (!user)
            throw new UnauthorizedException();
        return user;
    }
   
    // ─────────────────────────────────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────────────────────

    async findUserWithId(userId: number): Promise<User> {
        try {
            const user = await this.prisma.user.findUnique({
                where: {
                    id: userId,
                },
            });
            if (!user) {
                throw new NotFoundException(`User not found with id ${userId}`);
            }
            return user;
        } 
        catch (error) {
            console.error(`Error fetching user with id ${userId}`, error);
            throw error;
        }
    }
    
    async getUsernameWithId(userId: number): Promise<string> {
        try {
            const user = await this.prisma.user.findUnique({
                where: {
                    id: userId,
                },
            });
            if (!user) {
                throw new NotFoundException(`User not found with id ${userId}`);
            }
            return user.username;
        } catch (error) {
            console.error(`Error fetching user with id ${userId}`, error);
            throw error;
        }
    }
    

    async findUserWithUsername(usernameinput: string): Promise<User | undefined> {
        console.log("username INPUT ====", usernameinput);
        try {
            const user = await this.prisma.user.findUnique({
                where: {
                    username: usernameinput,
                },
            });
            if (!user) {
                throw new NotFoundException(`User not found with id ${usernameinput}`);
            }
            return user;
        } catch (error) {
            console.error(`Error fetching user with id ${usernameinput}`, error);
            throw error;
        }
    }
}