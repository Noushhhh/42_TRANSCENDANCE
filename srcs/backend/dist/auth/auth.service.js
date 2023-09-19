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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const argon = __importStar(require("argon2"));
const jwt_1 = require("@nestjs/jwt");
const crypto_1 = require("crypto");
const jwt = __importStar(require("jsonwebtoken"));
let AuthService = class AuthService {
    constructor(prisma, jwt) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.JWT_SECRET = process.env.JWT_SECRET;
        if (!this.JWT_SECRET) {
            throw new Error("JWT_SECRET environment variable not set!");
        }
    }
    signup(dto, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const hashPassword = yield argon.hash(dto.password);
            try {
                const user = yield this.prisma.user.create({
                    data: {
                        username: dto.username,
                        hashPassword,
                    },
                });
                return this.signToken(user.id, user.username, res);
                // return user;
            }
            catch (error) {
                if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                    console.log(error);
                    if (error.code === 'P2002') {
                        throw new common_1.ForbiddenException('Credentials taken');
                    }
                }
                throw error;
            }
        });
    }
    signin(dto, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // find user with username
            const user = yield this.prisma.user.findUnique({
                where: {
                    username: dto.username,
                }
            });
            // if user not found throw exception
            if (!user)
                throw new common_1.ForbiddenException('Username not found');
            // compare password
            const passwordMatch = yield argon.verify(user.hashPassword, dto.password);
            // if password wrong throw exception
            if (!passwordMatch)
                throw new common_1.ForbiddenException('Incorrect password');
            // send back the token
            return this.signToken(user.id, user.username, res);
        });
    }
    signToken(userId, email, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = {
                sub: userId,
                email,
            };
            const secret = this.JWT_SECRET;
            const token = yield this.jwt.signAsync(payload, {
                expiresIn: '15m',
                secret: secret,
            });
            // Generate a refresh token
            const refreshToken = this.createRefreshToken(userId);
            // Save refresh token in an HttpOnly cookie
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 30 // 30 days in milliseconds
            });
            // Existing JWT token cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 1000 * 60 * 15 // 15 minutes in milliseconds
            });
            res.status(200).send({ message: 'Authentication successful' });
        });
    }
    createRefreshToken(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const refreshToken = (0, crypto_1.randomBytes)(40).toString('hex'); // Generates a random 40-character hex string
            const expiration = new Date();
            expiration.setDate(expiration.getDate() + 7); // Set refreshToken expiration date within 7 days
            // Save refreshToken to database along with userId
            /*await this.prisma.refreshToken.create({
                data: {
                    token: refreshToken,
                    userId: userId,
                    expiresAt: expiration
                }
            });
    
            return refreshToken;*/
            return "hey";
        });
    }
    checkTokenValidity(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = req.cookies.token;
            console.log("passing by checktokenvalidity");
            if (!token)
                return res.status(401).json({ valid: false, message: "Token Missing" });
            try {
                jwt.verify(token, this.JWT_SECRET);
                return res.status(200).json({ valid: true, message: "Token is valid" });
            }
            catch (error) {
                return res.status(401).json({ valid: false, message: "Invalid Token" });
            }
        });
    }
    signout(res) {
        // Clear the JWT cookie or session
        try {
            res.clearCookie('token'); // assuming your token is saved in a cookie named 'token'
            return res.status(200).send({ message: 'Signed out successfully' });
        }
        catch (error) {
            console.error(error);
            return res.status(401).send({ message: "Cookie not found" });
        }
    }
    getUsernameFromId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = Number(id);
            try {
                const user = yield this.prisma.user.findUnique({
                    where: {
                        id: userId,
                    },
                    select: {
                        username: true,
                    }
                });
                if (user) {
                    console.log(user.username);
                    return user.username;
                }
                else {
                    return undefined;
                }
            }
            catch (error) {
                throw error;
            }
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
