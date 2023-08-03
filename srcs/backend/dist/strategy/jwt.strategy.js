"use strict";
// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { PrismaService } from '../prisma/prisma.service';
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
exports.JwtStrategy = void 0;
// //Auth Passport Strategy
// import { PassportStrategy } from '@nestjs/passport';
// //Auth Jwt
// import { ExtractJwt, Strategy } from 'passport-jwt';
// @Injectable()
// export class jwtStrategy extends PassportStrategy(Strategy) {
//     constructor(private prisma: PrismaService) {
// 		super({
// 			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
// 			secretOrKey: process.env.JWT_SECRET,
// 		});
// 	}
//     async validate(data: { sub: number; email: string; is2FA: boolean }) {
// 		const user = await this.prisma.user.findUnique({
// 			where: {
// 				id: data.sub,
// 			},
// 		});
// 		// if user is logged out return 401
// 		if (!user.hashedRtoken) return;
// 		// remove sensitive data
// 		if (user) delete user.hash;
// 		// if the user is not found user == NULL
// 		// 401 forbidden is returned.
// 		if (!user.twoFA) {
// 			return user;
// 		}
// 		if (data.is2FA) {
// 			return user;
// 		}
// 	}
// }
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const prisma_service_1 = require("../prisma/prisma.service");
let JwtStrategy = exports.JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy, 'jwt') {
    constructor(prisma) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET,
        });
        this.prisma = prisma;
    }
    validate(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log({ payload, });
            return payload;
            // return false;
        });
    }
};
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], JwtStrategy);
