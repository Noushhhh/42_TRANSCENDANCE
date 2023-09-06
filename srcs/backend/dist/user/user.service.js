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
const common_1 = require("@nestjs/common");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt = __importStar(require("jsonwebtoken"));
let UserService = class UserService {
    constructor(prisma, cloudinaryService) {
        this.prisma = prisma;
        this.cloudinaryService = cloudinaryService;
        this.JWT_SECRET = process.env.JWT_SECRET;
        if (!this.JWT_SECRET) {
            throw new Error("JWT_SECRET environment variable not set!");
        }
    }
    handleProfileSetup(userCookie, profileName, profileImage) {
        return __awaiter(this, void 0, void 0, function* () {
            // Decode the token to get user's info
            console.log("passing by beginning handleProfileSetup\n");
            console.log(userCookie + "\n");
            console.log(this.JWT_SECRET + "\n");
            let decodedToken;
            try {
                decodedToken = jwt.verify(userCookie, this.JWT_SECRET);
            }
            catch (error) {
                throw new Error('Invalid token.');
            }
            let resultEmail;
            if (typeof decodedToken === 'object' && decodedToken !== null) {
                resultEmail = decodedToken.email;
            }
            else {
                throw new Error('Invalid token format backend(handleProfileSetup).\n');
            }
            // Fetch user from the database
            const user = yield this.prisma.user.findUnique({ where: { username: resultEmail } });
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
        });
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cloudinary_service_1.CloudinaryService])
], UserService);
