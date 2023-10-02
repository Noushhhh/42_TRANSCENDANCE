"use strict";
// import {Controller, Get, Req, UseGuards, UnauthorizedException} from '@nestjs/common'
// // import { AuthGuard } from '@nestjs/passport';
// import { Request } from 'express';
// import { User } from '@prisma/client';
// // import { ConfigService } from '@nestjs/config';
// // import * as jwt from 'jsonwebtoken';
// import { JwtGuard } from '../auth/guard/';
// import { JwtStrategy } from '../strategy/jwt.strategy';
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
exports.UserController = void 0;
// @Controller ('users')
// export class UserController 
// {
//     // constructor(private config: ConfigService) {};
//     // constructor (private UserService: User)
//     @UseGuards(JwtGuard)
//     @Get ('me')
//     getMe(@Req() req: Request): User{
//         // return this.getMe(req);
//         // async getMe(@Req() req: Request): Promise<User> {
//             const jwtCookie = req.cookies['token'];
//             if (!jwtCookie) {
//               throw new UnauthorizedException('JWT token missing');
//             }
//             // Verify the JWT and get user information
//             const user = await this.jwtAuthService.verifyToken(jwtCookie);
//             if (!user) {
//               throw new UnauthorizedException('Invalid JWT token');
//             }
//             return user;
//           }
//     }
// }
// user.controller.ts
const common_1 = require("@nestjs/common");
const user_service_1 = require("./user.service");
// import { JwtGuard } from '../guards/jwt.guard';
let UserController = class UserController {
    constructor(
    // private readonly jwtAuthService: JwtAuthService,
    userService) {
        this.userService = userService;
    }
    // @UseGuards(JwtGuard)
    getMe(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const jwtCookie = req.cookies['token'];
            if (!jwtCookie) {
                throw new common_1.UnauthorizedException('JWT token missing');
            }
            // Verify the JWT and get user information
            const user = yield this.jwtAuthService.verifyToken(jwtCookie);
            if (!user) {
                throw new common_1.UnauthorizedException('Invalid JWT token');
            }
            return user;
        });
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getMe", null);
exports.UserController = UserController = __decorate([
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
