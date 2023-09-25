"use strict";
// import { Injectable } from "@nestjs/common";
// import { PrismaService } from '../prisma/prisma.service';
// import { Prisma, User } from '@prisma/client'
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
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
const common_1 = require("@nestjs/common");
let UserService = class UserService {
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)()
], UserService);
