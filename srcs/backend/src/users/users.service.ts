import {
    ForbiddenException, Injectable, NotFoundException, UnauthorizedException,
    InternalServerErrorException,
    Response as NestResponse
} from "@nestjs/common";
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UserProfileData } from '../interfaces/user.interface';
import { ExtractJwt } from '../decorators/extract-jwt.decorator';
import { DecodedPayload } from '../interfaces/decoded-payload.interface';
import * as fs from 'fs';
import { use } from "passport";

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
     * @throws {InternalServerErrorException} - Throws for any other errors.
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
                    throw new InternalServerErrorException('Error fetching avatar');
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
                    reject(new InternalServerErrorException('Failed to save image to local folder'));
                });
            });
        } catch (error) {
            // If an exception is thrown during the process, log the error
            console.error('Error in saveImageToLocalFolder service:', error);
            // Throw a NestJS InternalServerErrorException for consistent error handling
            throw new InternalServerErrorException('Error in saveImageToLocalFolder service');
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
         * @param userId - The ID of the user whose avatar is to be updated.
         * @param avatar - The new avatar file.
         *
    ***/

    async updateAvatar(userId: number | undefined, avatar: Express.Multer.File) {
        try {
            // Retrieve the current user's details from the database
            const currentUser = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { avatar: true, fortyTwoStudent: true },
            });

            // If the user is not found, throw a NotFoundException
            if (!currentUser) {
                throw new NotFoundException('User not found');
            }

            // Extract the path of the old avatar
            const oldAvatarPath = currentUser.avatar;

            // If there is an old avatar, attempt to delete it
            if (oldAvatarPath && !currentUser.fortyTwoStudent) {
                try {
                    // Use fs.unlinkSync for synchronous file deletion
                    fs.unlinkSync(oldAvatarPath);
                } catch (err) {
                    // If deletion fails, throw an InternalServerErrorException
                    throw new InternalServerErrorException('Error deleting old avatar');
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
                // If saving fails, throw an InternalServerErrorException
                throw new InternalServerErrorException('Failed to save image to local folder');
            }

            // Update the user's avatar path in the database
            try {
                await this.prisma.user.update({
                    where: { id: userId },
                    data: { avatar: newFilePath },
                });
            } catch (error) {
                // If updating the database fails, throw an InternalServerErrorException
                throw new InternalServerErrorException('Failed to update user avatar in database');
            }
        } catch (error) {
            // Catch any other errors that might occur and throw an InternalServerErrorException
            // throw new InternalServerErrorException('Error in updateAvatar service');
            throw error;
        }
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
            throw new Error(`User with id ${userId} not found.`);
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
}
