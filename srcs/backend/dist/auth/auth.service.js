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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
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
const axios_1 = __importDefault(require("axios"));
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
                return res.status(401).json({ message: 'Username not found' });
            // throw new ForbiddenException('Username not found',);
            // compare password
            const passwordMatch = yield argon.verify(user.hashPassword, dto.password);
            // if password wrong throw exception
            if (!passwordMatch)
                // throw new ForbiddenException('Incorrect password',);
                return res.status(401).json({ message: 'Incorrect password' });
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
            yield this.prisma.refreshToken.create({
                data: {
                    token: refreshToken,
                    userId: userId,
                    expiresAt: expiration
                }
            });
            return refreshToken;
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
    signToken42(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const code = req.query['code'];
            try {
                const token = yield this.exchangeCodeForToken(code);
                if (token) {
                    const userInfo = yield this.getUserInfo(token);
                    const user = yield this.createUser(userInfo);
                    return user;
                }
                else {
                    console.error('Failed to fetch access token');
                    // Handle errors here
                    throw new Error('Failed to fetch access token');
                }
            }
            catch (error) {
                console.error('Error in signToken42:', error);
                throw new Error('Failed to fetch sign Token 42');
            }
        });
    }
    exchangeCodeForToken(code) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.sendAuthorizationCodeRequest(code);
                return response.data.access_token;
            }
            catch (error) {
                console.error('Error fetching access token:', error);
                return null;
            }
        });
    }
    sendAuthorizationCodeRequest(code) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestBody = {
                grant_type: 'authorization_code',
                client_id: process.env.UID_42,
                client_secret: process.env.SECRET_42,
                code: code,
                redirect_uri: 'http://localhost:4000/api/auth/token',
            };
            return axios_1.default.post('https://api.intra.42.fr/oauth/token', null, { params: requestBody });
        });
    }
    getUserInfo(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.sendUserInfoRequest(token);
                //   const this.createUser(response.data);
                return response.data;
            }
            catch (error) {
                console.error('Error fetching user info:', error);
                throw error;
            }
        });
    }
    sendUserInfoRequest(token) {
        return __awaiter(this, void 0, void 0, function* () {
            return axios_1.default.get('https://api.intra.42.fr/v2/me', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        });
    }
    createUser(userInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield this.prisma.user.findUnique({
                where: {
                    id: userInfo.id,
                },
            });
            if (existingUser) {
                console.log('User already exists:', existingUser);
                // return this.signToken(existingUser.id, existingUser.username, res);
                //   return "User already exists";
                return existingUser;
            }
            try {
                let avatarUrl;
                if (userInfo.image.link === null) {
                    // Generate a random avatar URL or use a default one
                    avatarUrl = 'https://cdn.intra.42.fr/coalition/cover/302/air__1_.jpg';
                }
                else {
                    avatarUrl = userInfo.image.link;
                }
                const user = yield this.prisma.user.create({
                    data: {
                        id: userInfo.id,
                        hashPassword: this.generateRandomPassword(),
                        login: userInfo.login,
                        username: userInfo.login,
                        avatar: userInfo.image.link,
                    },
                });
                console.log("User created", user);
                // return this.signToken(user.id, user.username, res);
                return user;
            }
            catch (error) {
                console.error('Error saving user information to database:', error);
                throw error;
            }
        });
    }
    generateRandomPassword() {
        const password = Math.random().toString(36).slice(2, 15) +
            Math.random().toString(36).slice(2, 15);
        return password;
    }
};
exports.AuthService = AuthService;
__decorate([
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthService.prototype, "signToken42", null);
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
// async getUsernameFromId(id: number): Promise<string | undefined>{
//     const userId = Number(id);
//     try {
//         const user: { username: string; } | null = await this.prisma.user.findUnique({
//             where: {
//                 id: userId,
//             },
//             select: {
//                 username: true,
//             }
//         })
//         if (user){
//             console.log(user.username);
//             return user.username;
//         }
//         else{
//             return undefined;
//         }
//     } catch (error){
//         throw error;
//     }
// }
