"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
// Import necessary modules and dependencies
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const path_1 = require("path");
const uuid_1 = require("uuid");
// Define the UserService class and mark it as injectable using the @Injectable() decorator
let UserService = class UserService {
    // Constructor initializes the PrismaService and JWT_SECRET
    constructor(prisma) {
        this.prisma = prisma;
        this.uploadFolder = 'uploads';
        this.JWT_SECRET = process.env.JWT_SECRET;
        // Check if JWT_SECRET is set, otherwise throw an error
        if (!this.JWT_SECRET) {
            throw new Error('JWT_SECRET environment variable not set!');
        }
    }
    // Function to check if user has been already registered
    isClientRegistered(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.prisma.user.findUnique({ where: { username: payload === null || payload === void 0 ? void 0 : payload.email } });
                if (user === null || user === void 0 ? void 0 : user.firstConnection) {
                    return ({
                        statusCode: 200,
                        valid: true,
                        message: "Client already registered"
                    });
                }
                else {
                    return ({
                        statusCode: 404,
                        valid: false,
                        message: "Client is not registered yet"
                    });
                }
            }
            catch (error) {
                return {
                    statusCode: 401,
                    valid: false,
                    message: error
                };
            }
        });
    }
    // ─────────────────────────────────────────────────────────────────────
    // handleProfileSetup method takes tokenCookie, profileName, and profileImage as arguments
    handleProfileSetup(payload, profileName, profileImage) {
        return __awaiter(this, void 0, void 0, function* () {
            // Declare a variable to store the decoded JWT token
            const emailFromCookies = payload === null || payload === void 0 ? void 0 : payload.email;
            const registeredUser = yield this.prisma.user.findUnique({ where: { publicName: profileName } });
            if (registeredUser) {
                return {
                    statusCode: 409,
                    valid: false,
                    message: 'Username already exists',
                };
            }
            // Fetch the user from the database using the PrismaService and the email from the decoded token
            const user = yield this.prisma.user.findUnique({ where: { username: emailFromCookies } });
            // Check if the user exists, otherwise throw an error
            if (!user) {
                return {
                    statusCode: 404,
                    valid: false,
                    message: 'username not found',
                };
            }
            // Get the file extension of the profile image
            const fileExtension = (0, path_1.extname)(profileImage.originalname);
            // Generate a unique filename using uuidv4 and the file extension
            const uniqueFilename = (0, uuid_1.v4)() + fileExtension;
            // Construct the file path for the profile image in the upload folder
            const filePath = `${this.uploadFolder}/${uniqueFilename}`;
            // Save the profile image to the local folder using the saveImageToLocalFolder method
            try {
                yield this.saveImageToLocalFolder(profileImage, filePath);
            }
            catch (error) {
                console.error(error);
                return {
                    statusCode: 400,
                    valid: false,
                    message: error,
                };
            }
            // Update the user profile in the database using the PrismaService
            try {
                yield this.prisma.user.update({
                    where: { id: user.id },
                    data: {
                        publicName: profileName,
                        avatar: filePath,
                        firstConnection: true
                    },
                });
                // Return the updated user profile
                return {
                    statusCode: 200,
                    valid: true,
                    message: "Profile was successfully updated"
                };
            }
            catch (error) {
                return ({
                    statusCode: 400,
                    valid: false,
                    message: error
                });
            }
        });
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // saveImageToLocalFolder method takes a file and a file path as arguments
    saveImageToLocalFolder(file, filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Import the 'fs' module to work with the file system
                const fs = require('fs');
                // Create a write stream to write the file buffer to the specified file path
                const writeStream = fs.createWriteStream(filePath);
                // Write the file buffer to the write stream
                writeStream.write(file.buffer);
                // End the write stream
                writeStream.end();
            }
            catch (error) {
                throw error;
            }
        });
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
// import { Injectable } from "@nestjs/common";
// import { PrismaService } from '../prisma/prisma.service';
// import { Prisma, User } from '@prisma/client'
// @Injectable({})
// export class UserService {
//     constructor(
//         private prisma: PrismaService,
//     )
// //     async set2faSecret(secret: string, id: string) {
// //         const user = await this.usersRepository.findOneBy({id});
// //         user.twoFactorSecret = secret;
// //         await this.usersRepository.save(user);
// //         return (user.twoFactorSecret);
// //     }
// // }
//     async findUserByUsername(username: string): Promise<User | null> {
//         return this.prisma.user.findUnique({
//             where: {
//                 username,
//             },
//         });
//     }
// }
