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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt = __importStar(require("jsonwebtoken"));
// import { User } from '@prisma/client'
let UserService = class UserService {
    constructor(
    // private prisma: PrismaService,
    config) {
        this.config = config;
    }
    getMe(req) {
        try {
            console.log('get me called');
            const jwtCookie = req.cookies['token'];
            const secret = this.config.get('JWT_SECRET');
            const user = jwt.verify(jwtCookie, secret);
            return user;
        }
        catch (error) {
            console.log(error);
        }
    }
};
exports.UserService = UserService;
__decorate([
    __param(0, (0, common_2.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserService.prototype, "getMe", null);
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], UserService);
// // //     async set2faSecret(secret: string, id: string) {
// // //         const user = await this.usersRepository.findOneBy({id});
// // //         user.twoFactorSecret = secret;
// // //         await this.usersRepository.save(user);
// // //         return (user.twoFactorSecret);
// // //     }
// // // }
//     async findUserByUsername(username: string): Promise<User | null> {
//         return this.prisma.user.findUnique({
//             where: {
//                 username,
//             },
//         });
//     }
// }
//     // async getUsernameFromId(id: number): Promise<string | undefined>{
//     //     const userId = Number(id);
//     //     try {
//     //         const user: { username: string; } | null = await this.prisma.user.findUnique({
//     //             where: {
//     //                 id: userId,
//     //             },
//     //             select: {
//     //                 username: true,
//     //             }
//     //         })
//     //         if (user){
//     //             console.log(user.username);
//     //             return user.username;
//     //         }
//     //         else{
//     //             return undefined;
//     //         }
//     //     } catch (error){
//     //         throw error;
//     //     }
//     // 
