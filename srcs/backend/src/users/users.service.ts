import {
    ForbiddenException, Injectable, NotFoundException, UnauthorizedException,
    Response as NestResponse, BadRequestException, Logger, ConflictException
} from "@nestjs/common";
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { extname } from 'path';
import { imageSize } from 'image-size';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { UserProfileData } from '../interfaces/user.interface';
import { ExtractJwt } from '../decorators/extract-jwt.decorator';
import { DecodedPayload } from '../interfaces/decoded-payload.interface';
import axios from 'axios';
import { Readable } from 'stream'; // Import Readable from 'stream' module
import { use } from "passport";
import { DEFAULT_AVATAR_PATH } from '../auth/constants/constants'; // Path to the default avatar image


//defaul avatar path

interface FriendRequestFromUser {
    id: number;
    publicName?: string | null;
    userName: string;
    avatar?: string | null;
}

interface UserProfile {
    id: number;
    publicName?: string | null;
    userName: string;
    avatar?: string | null;
    gamePlayed: number;
    gameWon: number;
}

interface ImageTypeResult {
    mime: string;
}

@Injectable()
export class UsersService {
    // Declare private variables for JWT secret and upload folder path
    private JWT_SECRET: string | any;
    private readonly uploadFolder = 'uploads';
    private readonly logger = new Logger(UsersService.name);

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
                where: { id: payload?.sub },
            });
            if (!user) throw new NotFoundException('User not found');

            const isNotRegistered = user?.firstConnexion;
            if (isNotRegistered) {
                return {
                    statusCode: 200,
                    valid: false,
                    message: 'Client not registered yet',
                };
            } else {
                return {
                    statusCode: 200,
                    valid: true,
                    message: 'Client already registered',
                };
            }
        } catch (error) {
            throw new UnauthorizedException(error);
        }
    }

    // ─────────────────────────────────────────────────────────────────────

    /**
     * Retrieves and sends the user's avatar image in the response.
     * 
     * @param {DecodedPayload} decodedPayload - The JWT decoded payload.
     * @param {Response} res - The response object from NestJS.
     * @throws {NotFoundException} - Throws when the avatar or user is not found.
     */
    async getUserAvatar(@ExtractJwt() decodedPayload: DecodedPayload, @NestResponse() res: Response) {
        try {
            // Get the user profile using the decoded payload's subject (usually the user ID)
            const user = await this.getUserData(decodedPayload.sub);

            // Check if the user has an avatar set
            const path = user?.avatar;
            if (!path) {
                throw new NotFoundException('Avatar not found');
            }

            // Set the appropriate MIME type for the avatar image
            res.type('image/jpeg');

            // Create a read stream for the avatar file
            const stream = fs.createReadStream(path);

            stream.on('open', () => {
                // Pipe the read stream to the response object to send the image data
                stream.pipe(res);
            });

            stream.on('error', (err: NodeJS.ErrnoException) => {
                // Handle file read/stream errors
                if (err.code === 'ENOENT') {
                    // File not found, throw NestJS NotFoundException
                    throw new NotFoundException('Avatar not found');
                } else {
                    // Other errors, throw NestJS InternalServerErrorException
                    throw new BadRequestException('Error fetching avatar');
                }
            });
        } catch (error) {
            // Catch any other errors that might occur and throw an InternalServerErrorException
            console.error('Error in getUserAvatar service:', error);
            throw error;
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

            // Return a promise that resolves when the write stream finishes writing
            return new Promise((resolve, reject) => {
                writeStream.on('finish', resolve);
                writeStream.on('error', (error: Error) => {
                    // Log the error and reject the promise if an error occurs during the write process
                    console.error('Error saving image to local folder:', error);
                    reject(new ForbiddenException('Failed to save image to local folder'));
                });
            });
        } catch (error) {
            // If an exception is thrown during the process, log the error
            console.error('Error in saveImageToLocalFolder service:', error);
            // Throw a NestJS for consistent error handling
            throw new ForbiddenException('Error in saveImageToLocalFolder service');
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
                username: true
            },
        });
        if (!user)
            throw new NotFoundException('User not found in getUserData service');
        return user;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * Updates the public name of a user.
     *
     * @param {number} userId - The ID of the user.
     * @param {string} publicName - The new public name to be set for the user.
     * @returns {object} - An object with the status of the update operation.
     * @throws {ForbiddenException} - Throws when the public name is already taken by another user.
     * @throws {NotFoundException} - Throws if there is an error during the update process.
     */
    async updatePublicName(userId: number, publicName: string) {
        try {
            // Check if the public name is already taken by another user
            // This query uses a case-insensitive search to find a user with the given publicName
            const user = await this.prisma.user.findFirst({
                where: {
                    publicName: {
                        mode: 'insensitive', // Enable case-insensitive filter
                        equals: publicName // Compare with the provided publicName
                    }
                },
                select: {
                    id: true, // Select user id
                    username: true, // Select username
                    publicName: true, // Select publicName
                },
            });

            // If a user with the same publicName is found, throw an exception
            if (user) {
                throw new ForbiddenException("Public name already taken, please choose another one");
            }

            // Update the user's public name in the database
            await this.prisma.user.update({
                where: { id: userId },
                data: {
                    publicName: publicName,
                    firstConnexion: false
                },
            });

            // Return a success response
            return ({
                statusCode: 200,
                valid: true,
                message: "Public name was updated successfully",
            });
        } catch (error) {
            throw error;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────────

    /**
    * Updates the avatar for a given user.
    * 
    * This function performs several key tasks:
    * 1. Validates the uploaded image file in terms of size and type.
    *    - Checks if the file size exceeds a predefined maximum (5MB).
    *    - Uses the 'image-size' library to determine if the uploaded file is a valid image.
    *      If the file is not a valid image, 'image-size' will either return undefined dimensions
    *      or throw an error, which is used to validate the file.
    * 2. Deletes the old avatar if it exists and is not the default avatar.
    *    - The path of the old avatar is retrieved from the user's details in the database.
    *    - If an old avatar exists, it attempts to delete it from the filesystem.
    * 3. Generates a unique filename for the new avatar and saves it to a local folder.
    *    - A unique filename is generated using UUID and the file extension of the original file.
    *    - This new file is saved to a specified upload folder.
    * 4. Updates the user's avatar path in the database with the path of the new avatar.
    *    - The avatar path in the user's record is updated to reflect the new file's location.
    * 
    * @param userId - The ID of the user whose avatar is to be updated.
    * @param avatar - The new avatar file, received as an Express.Multer.File object.
    * @throws ForbiddenException if the file size is too large or if the file is not a valid image.
    * @throws ForbiddenException if there's an error deleting the old avatar.
    * @throws ForbiddenException if saving the new avatar to the local folder fails.
    * @throws ConflictException if updating the user's avatar in the database fails.
    * @returns void
    */

    async updateAvatar(userId: number, avatar: Express.Multer.File) {
        try {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            const maxFileSize = 5 * 1024 * 1024; // 5MB

            // Check file size
            if (avatar.size > maxFileSize) {
                throw new ForbiddenException("File size too large. Please upload an image smaller than 5MB.");
            }

            // Use image-size to validate the image
            try {
                const dimensions = imageSize(avatar.buffer);
                if (!dimensions) {
                    throw new ForbiddenException("Invalid image file.");
                }
            } catch (err) {
                throw new ForbiddenException("Invalid image file.");
            }
            // Retrieve the current user's details from the database
            const currentUser = await this.findUserWithId(userId);

            // Extract the path of the old avatar
            const oldAvatarPath = currentUser.avatar;

            // If there is an old avatar, attempt to delete it
            if (oldAvatarPath && oldAvatarPath !== DEFAULT_AVATAR_PATH) {
                try {
                    // Use fs.unlinkSync for synchronous file deletion
                    fs.unlinkSync(oldAvatarPath);
                } catch (err) {
                    // If deletion fails, throw 
                    throw new ForbiddenException('Error deleting old avatar');
                }
            }

            // Generate a unique filename for the new avatar
            const uniqueFilename = uuidv4() + extname(avatar.originalname);
            // Combine the upload folder path with the unique filename
            const newFilePath = `${this.uploadFolder}/${uniqueFilename}`;

            // Attempt to save the new avatar to the local folder
            try {
                await this.saveImageToLocalFolder(avatar, newFilePath);
            } catch (error) {
                // If saving fails, throw
                throw new ForbiddenException('Failed to save image to local folder');
            }

            // Update the user's avatar path in the database
            try {
                await this.prisma.user.update({
                    where: { id: userId },
                    data: { avatar: newFilePath },
                });
            } catch (error) {
                // If updating the database fails
                throw new ConflictException('Failed to update user avatar in database');
            }
        } catch (error) {
            // Catch any other errors that might occur and throw an InternalServerErrorException
            throw error;
        }
    }


    // ─────────────────────────────────────────────────────────────────────

    async downloadFile(url: string): Promise<Express.Multer.File> {
        try {
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data, 'binary');

            const fileName = this.extractFileName(url);
            const mimeType = response.headers['content-type'] || this.getMimeType(fileName);
            const size = response.headers['content-length'] || buffer.length;

            const file: Express.Multer.File = {
                buffer: buffer,
                originalname: fileName,
                mimetype: mimeType,
                size: size,
                fieldname: '', // Placeholder
                encoding: '7bit', // Common default
                stream: new Readable({
                    read() {
                        this.push(buffer);
                        this.push(null); // Indicate the end of the stream
                    }
                }),
                destination: '', // Placeholder
                filename: fileName, // Use the same as originalname
                path: '', // Placeholder
            };

            return file;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error('Failed to download file: ' + error.message);
            } else {
                throw new Error('Failed to download file: An unknown error occurred');
            }
        }
    }

    private extractFileName(url: string): string {
        return url.split('/').pop() || 'downloadedFile';
    }

    private getMimeType(fileName: string): string {
        const extension: string | undefined = fileName.split('.').pop()?.toLowerCase();

        if (!extension)
            return 'application/octet-stream'

        const imageMimeTypes: { [key: string]: string } = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'bmp': 'image/bmp',
            'tiff': 'image/tiff',
            'webp': 'image/webp',
            // Add more image MIME types if necessary
        };
        return imageMimeTypes[extension];
    }


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

    // ─────────────────────────────────────────────────────────────────────────────

    async getPublicName(userId: number): Promise<string | null> {
        try {
            const user = await this.prisma.user.findUnique({
                where: {
                    id: userId,
                },
            });
            if (!user) {
                throw new NotFoundException(`User not found with`);
            }
            return user.publicName;
        } catch (error) {
            console.error(`Error fetching user with id ${userId}`, error);
            throw error;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────────

    async findUserWithUsername(usernameinput: string): Promise<User> {
        try {
            console.log("username INPUT ====", usernameinput);
            const user = await this.prisma.user.findUnique({
                where: {
                    username: usernameinput,
                },
            });
            if (!user) {
                throw new NotFoundException(`User not found with user name ${usernameinput}`);
            }
            return user;
        } catch (error) {
            throw error;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────────

    async sendFriendRequest(senderId: number, targetId: number) {
        const sender = await this.prisma.user.findUnique({
            where: {
                id: senderId,
            }
        })

        if (!sender) throw new NotFoundException("User not found");

        const target = await this.prisma.user.findUnique({
            where: {
                id: targetId
            }
        })

        if (!target) throw new NotFoundException("User not found");

        if (await this.areUsersFriends(senderId, targetId))
            return;

        await this.prisma.user.update({
            where: { id: senderId },
            data: {
                pendingRequestFor: {
                    connect: { id: targetId }
                }
            }
        })

        await this.prisma.user.update({
            where: { id: targetId },
            data: {
                pendingRequestFrom: {
                    connect: { id: senderId }
                }
            }
        })
    }

    async getPendingRequests(userId: number): Promise<FriendRequestFromUser[]> {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
            }
        })

        if (!user) throw new NotFoundException("User not found");

        const pendingRequests = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                pendingRequestFrom: true,
            },
        });

        if (!pendingRequests) return [];

        const transformedArray: FriendRequestFromUser[] = pendingRequests?.pendingRequestFrom.map((user) => ({
            id: user.id,
            publicName: user.publicName,
            userName: user.username,
            avatar: user.avatar
        }));

        return transformedArray;
    }

    async acceptFriendRequest(senderId: number, targetId: number) {
        const sender = await this.prisma.user.findUnique({
            where: {
                id: senderId,
            }
        })

        if (!sender) throw new NotFoundException("User not found");

        const target = await this.prisma.user.findUnique({
            where: {
                id: targetId
            }
        })

        if (!target) throw new NotFoundException("User not found");

        await this.prisma.user.update({
            where: { id: senderId },
            data: {
                pendingRequestFrom: {
                    disconnect: { id: targetId }
                }
            }
        })

        await this.prisma.user.update({
            where: { id: targetId },
            data: {
                pendingRequestFor: {
                    disconnect: { id: senderId }
                }
            }
        })

        await this.prisma.user.update({
            where: { id: senderId },
            data: {
                friends: {
                    connect: { id: targetId }
                },
                friendOf: {
                    connect: { id: targetId }
                }
            }
        })

        await this.prisma.user.update({
            where: { id: targetId },
            data: {
                friendOf: {
                    connect: { id: senderId }
                },
                friends: {
                    connect: { id: senderId }
                }
            }
        })
    }

    async refuseFriendRequest(senderId: number, targetId: number) {
        const sender = await this.prisma.user.findUnique({
            where: {
                id: senderId,
            }
        })

        if (!sender) throw new NotFoundException("User not found");

        const target = await this.prisma.user.findUnique({
            where: {
                id: targetId
            }
        })

        if (!target) throw new NotFoundException("User not found");

        await this.prisma.user.update({
            where: { id: senderId },
            data: {
                pendingRequestFrom: {
                    disconnect: { id: targetId }
                }
            }
        })

        await this.prisma.user.update({
            where: { id: targetId },
            data: {
                pendingRequestFor: {
                    disconnect: { id: senderId }
                }
            }
        })
    }

    async getFriendsList(userId: number): Promise<FriendRequestFromUser[]> {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
            }
        })

        if (!user) throw new NotFoundException("User not found");

        const friendsList = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                friends: true,
            },
        });

        if (!friendsList) return [];

        const transformedArray: FriendRequestFromUser[] = friendsList?.friends.map((user) => ({
            id: user.id,
            publicName: user.publicName,
            userName: user.username,
            avatar: user.avatar,
        }));

        return transformedArray;
    }

    async removeFriend(senderId: number, targetId: number) {
        const sender = await this.prisma.user.findUnique({
            where: {
                id: senderId,
            }
        })

        if (!sender) throw new NotFoundException("User not found");

        const target = await this.prisma.user.findUnique({
            where: {
                id: targetId
            }
        })

        if (!target) throw new NotFoundException("User not found");

        await this.prisma.user.update({
            where: { id: senderId },
            data: {
                friends: {
                    disconnect: { id: targetId }
                },
                friendOf: {
                    disconnect: { id: targetId }
                }
            }
        })

        await this.prisma.user.update({
            where: { id: targetId },
            data: {
                friends: {
                    disconnect: { id: senderId }
                },
                friendOf: {
                    disconnect: { id: senderId }
                }
            }
        })
    }

    async getFriendIds(userId: number): Promise<number[]> {
        const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { friends: true } });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const userIdMap = user.friends.map((friend) => friend.id);

        return user.friends.map((friend) => friend.id);
    }

    async areUsersFriends(userId1: number, userId2: number) {
        const user1 = await this.prisma.user.findUnique({
            where: { id: userId1 },
            include: { friends: true },
        });

        if (!user1) {
            throw new Error(`User with id ${userId1} not found.`);
        }

        return user1.friends.some((friend) => friend.id === userId2);
    }

    async getUserProfile(userId: number): Promise<UserProfile> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException(`User with id ${userId} not found.`);
        }

        const userProfile: UserProfile = {
            id: user.id,
            publicName: user.publicName,
            userName: user.username,
            avatar: user.avatar,
            gamePlayed: user.gamesPlayed,
            gameWon: user.gamesWon
        }

        return userProfile;
    }


    async getUsersWithStr(userId: number, toFind: string): Promise<FriendRequestFromUser[]> {
        const users = await this.prisma.user.findMany({
            where: {
                AND: [
                    {
                        publicName: {
                            contains: toFind,
                            mode: 'insensitive',
                        },
                    },
                    {
                        id: {
                            not: userId,
                        },
                    },
                    {
                        NOT: {
                            friendOf: {
                                some: {
                                    id: userId,
                                },
                            },
                        },
                    },
                ],
            },
        });


        const usersWithSelectedInfo = users.map((user) => ({
            id: user.id,
            publicName: user.publicName,
            userName: user.username,
            avatar: user.avatar,
        }));

        return usersWithSelectedInfo;
    }
}
