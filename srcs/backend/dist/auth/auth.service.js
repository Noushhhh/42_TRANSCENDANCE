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
const axios_1 = __importDefault(require("axios"));
let AuthService = class AuthService {
    constructor(prisma, jwt) {
        this.prisma = prisma;
        this.jwt = jwt;
    }
    signup(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, username, password } = dto;
            const hashPassword = yield argon.hash(password);
            try {
                const user = yield this.prisma.user.create({
                    data: {
                        email,
                        username,
                        hashPassword,
                    },
                });
                return this.signJwtToken(user.id, user.username);
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
    signin(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, password } = dto;
            const user = yield this.prisma.user.findUnique({
                where: {
                    username,
                }
            });
            if (!user)
                throw new common_1.ForbiddenException('Username not found');
            const passwordMatch = yield argon.verify(user.hashPassword, password);
            if (!passwordMatch)
                throw new common_1.ForbiddenException('Incorrect password');
            return this.signJwtToken(user.id, user.username);
        });
    }
    signJwtToken(userId, email) {
        return __awaiter(this, void 0, void 0, function* () {
            const login_data = {
                sub: userId,
                email,
            };
            const secret = process.env.JWT_SECRET;
            const token = yield this.jwt.signAsync(login_data, {
                expiresIn: '15m',
                secret: secret,
            });
            return {
                access_token: token,
            };
        });
    }
    signToken42(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const code = req.query['code'];
            const token = yield this.exchangeCodeForToken(code);
            if (token) {
                const userInfo = yield this.getUserInfo(token);
                console.log('User Info:', userInfo);
            }
            else {
                console.error('Failed to fetch access token');
            }
        });
    }
    exchangeCodeForToken(code) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.post('https://api.intra.42.fr/oauth/token', null, {
                    params: {
                        grant_type: 'authorization_code',
                        client_id: process.env.UID_42,
                        client_secret: process.env.SECRET_42,
                        code: code,
                        redirect_uri: 'http://localhost:4000/api/auth/token',
                    },
                });
                return response.data.access_token;
            }
            catch (error) {
                console.error('Error fetching access token:', error);
                return null;
            }
        });
    }
    getUserInfo(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get('https://api.intra.42.fr/v2/me', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log(response);
                this.createUser(response.data);
            }
            catch (error) {
                console.error('Error fetching user info:', error);
                throw error;
            }
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
                return;
            }
            try {
                const user = yield this.prisma.user.create({
                    data: {
                        id: userInfo.id,
                        hashPassword: 'x',
                        username: userInfo.login,
                        email: userInfo.email,
                        avatar: userInfo.image.link,
                    },
                });
                console.log(user);
            }
            catch (error) {
                console.error('Error saving user information to database:', error);
                throw error;
            }
        });
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
//# sourceMappingURL=auth.service.js.map