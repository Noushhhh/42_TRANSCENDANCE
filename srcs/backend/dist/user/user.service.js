"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
const jwt = __importStar(require("jsonwebtoken"));
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
    // handleProfileSetup method takes userCookie, profileName, and profileImage as arguments
    handleProfileSetup(userCookie, profileName, profileImage) {
        return __awaiter(this, void 0, void 0, function* () {
            // Declare a variable to store the decoded JWT token
            let decodedToken;
            // Try to decode the JWT token using the JWT_SECRET
            try {
                decodedToken = jwt.verify(userCookie, this.JWT_SECRET);
            }
            catch (error) {
                throw new Error('Invalid token.');
            }
            // Declare a variable to store the email from the decoded token
            let resultEmail;
            // Check if the decoded token is an object and has an email property
            if (typeof decodedToken === 'object' && decodedToken !== null) {
                resultEmail = decodedToken.email;
            }
            else {
                throw new Error('Invalid token format backend(handleProfileSetup).\n');
            }
            // Fetch the user from the database using the PrismaService and the email from the decoded token
            const user = yield this.prisma.user.findUnique({ where: { username: resultEmail } });
            // Check if the user exists, otherwise throw an error
            if (!user) {
                throw new Error('User not found.');
            }
            // Get the file extension of the profile image
            const fileExtension = (0, path_1.extname)(profileImage.originalname);
            // Generate a unique filename using uuidv4 and the file extension
            const uniqueFilename = (0, uuid_1.v4)() + fileExtension;
            // Construct the file path for the profile image in the upload folder
            const filePath = `${this.uploadFolder}/${uniqueFilename}`;
            // Save the profile image to the local folder using the saveImageToLocalFolder method
            yield this.saveImageToLocalFolder(profileImage, filePath);
            // Update the user profile in the database using the PrismaService
            const userProfile = yield this.prisma.user.update({
                where: { id: user.id },
                data: {
                    username: profileName,
                    profileImageUrl: filePath,
                },
            });
            // Return the updated user profile
            return userProfile;
        });
    }
    // saveImageToLocalFolder method takes a file and a file path as arguments
    saveImageToLocalFolder(file, filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            // Import the 'fs' module to work with the file system
            const fs = require('fs');
            // Create a write stream to write the file buffer to the specified file path
            const writeStream = fs.createWriteStream(filePath);
            // Write the file buffer to the write stream
            writeStream.write(file.buffer);
            // End the write stream
            writeStream.end();
        });
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
