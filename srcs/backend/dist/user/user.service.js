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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UserService = class UserService {
    constructor(prisma) {
        this.prisma = prisma;
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
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
