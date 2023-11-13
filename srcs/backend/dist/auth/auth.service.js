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
const speakeasy = __importStar(require("speakeasy"));
const users_service_1 = require("../users/users.service");
const constants_1 = require("../auth/constants/constants");
/**
 * @file auth.service.ts
 * @author Your Name
 * @date 2023-10-18
 * @brief This file contains the AuthService class, which provides authentication-related services.
 */
/**
 * @class AuthService
 * @brief This class provides authentication-related services.
 */
let AuthService = class AuthService {
    constructor(usersService, prisma, jwt) {
        this.usersService = usersService;
        this.prisma = prisma;
        this.jwt = jwt;
        this.JWT_SECRET = constants_1.jwtConstants.secret;
        if (!this.JWT_SECRET) {
            throw new Error("JWT_SECRET environment variable not set!");
        }
    }
    /**
     * @brief This function handles user signup requests.
     * @param dto The data transfer object containing user information.
     * @param res The response object.
     * @return The result of the signup operation.
     */
    signup(dto, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const hashPassword = yield argon.hash(dto.password);
            console.log(`passing by signup service username: ${dto.username} password ${dto.password}`);
            try {
                const user = yield this.prisma.user.create({
                    data: {
                        username: dto.username,
                        hashPassword,
                        fortyTwoStudent: false,
                        avatar: null
                    },
                });
                console.log(`passing by signup service after user result from prisma ${user.id}, ${user.username}, ${user.hashPassword}`);
                // return this.signToken(user.id, user.username, res);
            }
            catch (error) {
                if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                    if (error.code === 'P2002') {
                        throw new common_1.ForbiddenException('This username is already taken. Please choose another one.');
                    }
                }
                throw error;
            }
            return res.status(200).json({ valid: true, message: "user was create successfully" });
        });
    }
    // ─────────────────────────────────────────────────────────────────────────────
    /**
     * @brief This function handles user signin requests.
     * @param dto The data transfer object containing user information.
     * @param res The response object.
     * @return The result of the signin operation.
     */
    signin(dto, res, req) {
        return __awaiter(this, void 0, void 0, function* () {
            // find user with username
            const user = yield this.usersService.findUserWithUsername(dto.username);
            // if user not found throw exception
            if (!user)
                throw new common_1.ForbiddenException('Username not found');
            const userLoggedIn = yield this.checkUserLoggedIn(user.id);
            // console.log("passing by userLoggedIn", userLoggedIn, "\n");
            if (userLoggedIn.statusCode === 200) {
                console.log("user already logged in ", userLoggedIn.statusCode);
                throw new common_1.ForbiddenException('User is already logged in');
            }
            if (req.cookies.token && userLoggedIn.statusCode == 200)
                throw new common_1.ForbiddenException("someone is already logged in in this sessionn");
            else {
                res.clearCookie('token');
                res.clearCookie('refreshToken');
            }
            // compare password
            const passwordMatch = yield argon.verify(user.hashPassword, dto.password);
            // if password wrong throw exception
            if (!passwordMatch)
                throw new common_1.ForbiddenException('Incorrect password');
            // send back the token
            const result = yield this.signToken(user.id, user.username, res);
            // Update the user's logged in status in the database
            if (result.valid) {
                this.updateUserLoggedIn(user.id, true);
                res.status(200).send({ valid: result.valid, message: result.message });
            }
        });
    }
    /**
     * @brief This function validates a user.
     * @param dto The data transfer object containing user information.
     * @return The user if found, otherwise throws an UnauthorizedException.
     */
    validateUser(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.usersService.findUserWithUsername(dto.username);
            if (!user)
                throw new common_1.UnauthorizedException();
            return user;
        });
    }
    // ─────────────────────────────────────────────────────────────────────────────
    /**
     * @brief This function checks if there is an existing refresh token for the user and returns it if it exists. If not, it creates a new refresh token.
     * @param userId The user's ID.
     * @return An object containing the token and its expiration date.
     */
    refreshTokenIfNeeded(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existingRefreshToken = yield this.prisma.refreshToken.findFirst({
                    where: {
                        userId: userId,
                        expiresAt: { gte: new Date(), },
                    },
                });
                if (existingRefreshToken) {
                    return { token: existingRefreshToken.token, expiresAt: existingRefreshToken.expiresAt };
                }
                else {
                    const newRefreshToken = yield this.createRefreshToken(userId);
                    return { token: newRefreshToken.token, expiresAt: newRefreshToken.ExpirationDate };
                }
            }
            catch (error) {
                throw new common_1.InternalServerErrorException('Failed to find or create refresh token for user');
            }
        });
    }
    // ─────────────────────────────────────────────────────────────────────────────
    generateTokens(userId, email) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = { sub: userId, email, };
            const secret = this.JWT_SECRET;
            const token = yield this.jwt.signAsync(payload, { expiresIn: '30d', secret: secret, });
            const refreshToken = yield this.refreshTokenIfNeeded(userId);
            return { token, refreshToken };
        });
    }
    // ─────────────────────────────────────────────────────────────────────────────
    setTokens(tokens, res) {
        if (tokens.refreshToken) {
            res.cookie('refreshToken', tokens.refreshToken.token, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: (tokens.refreshToken.expiresAt.getTime() - Date.now()) });
        }
        res.cookie('token', tokens.token, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 1000 * 60 * 15 });
    }
    // ─────────────────────────────────────────────────────────────────────────────
    /**
     * @brief This function signs a token.
     * @param userId The user's ID.
     * @param username The user's username.
     * @param res The response object.
     * @return A promise that resolves to void.
     */
    signToken(userId, email, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { token, refreshToken } = yield this.generateTokens(userId, email);
            this.setTokens({ token, refreshToken }, res);
            if (!refreshToken) {
                return ({ statusCode: 409, valid: false, message: "Problem creating refresh token for user" });
            }
            const decodedToken = jwt.verify(token, this.JWT_SECRET);
            if (typeof decodedToken === 'object' && 'exp' in decodedToken) {
                res.cookie('tokenExpires', new Date(decodedToken.exp * 1000).toISOString(), { secure: true, sameSite: 'strict', maxAge: 1000 * 60 * 15 });
            }
            else {
                return ({ statusCode: 409, valid: false, message: "Impossible to decode token to create expiration time for user" });
            }
            return ({ statusCode: 200, valid: true, message: "Authentication successful" });
        });
    }
    // ─────────────────────────────────────────────────────────────────────────────
    /**
     * @brief This function creates a refresh token.
     * @param userId The user's ID.
     * @return token: string, ExpirationDate: Date
     */
    createRefreshToken(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const refreshToken = (0, crypto_1.randomBytes)(40).toString('hex');
            const expiration = new Date();
            expiration.setDate(expiration.getDate() + 7);
            try {
                yield this.prisma.refreshToken.create({
                    data: {
                        token: refreshToken,
                        userId: userId,
                        expiresAt: expiration
                    }
                });
                return { token: refreshToken, ExpirationDate: expiration };
            }
            catch (error) {
                throw new common_1.InternalServerErrorException('Failed to create refresh token');
            }
        });
    }
    // ─────────────────────────────────────────────────────────────────────────────
    /**
     * @brief This function updates the user's logged in status.
     * @param userId The user's ID.
     * @param inputBoolean The new logged in status.
     */
    updateUserLoggedIn(userId, inputBoolean) {
        return __awaiter(this, void 0, void 0, function* () {
            //update user login status 
            yield this.prisma.user.update({
                where: { id: userId },
                data: {
                    loggedIn: inputBoolean,
                },
            });
        });
    }
    // ─────────────────────────────────────────────────────────────────────────────
    /**
     * @brief This function checks if the user is logged in.
     * @param userId The user's ID.
     * @return The user's logged in status.
     */
    checkUserLoggedIn(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.usersService.findUserWithId(userId);
                if (!user)
                    throw new common_1.ForbiddenException('Username not found');
                // console.log("Passing by checkUserLoggedIn", user.loggedIn, user);
                if (user.loggedIn) {
                    return ({
                        statusCode: 200,
                        valid: true,
                        message: "User is logged in"
                    });
                }
                else {
                    return ({
                        statusCode: 400,
                        valid: true,
                        message: "User is not logged in"
                    });
                }
            }
            catch (error) {
                return ({
                    statusCode: 400,
                    valid: false,
                    message: `Error finding userid ${userId} ` + error
                });
            }
        });
    }
    // ─────────────────────────────────────────────────────────────────────────────
    checkOnlyTokenValidity(token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!token)
                throw new common_1.ForbiddenException("Token not provided");
            try {
                const user = jwt.verify(token, this.JWT_SECRET);
                if (!user)
                    return null;
                if (user.sub)
                    return Number(user.sub);
            }
            catch (error) {
                return null;
            }
            return null;
        });
    }
    // ─────────────────────────────────────────────────────────────────────────────
    /**
     * @brief This function checks the validity of the token.
     * @param req The request object.
     * @param res The response object.
     * @return The token's validity status.
     */
    checkTokenValidity(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = req.cookies.token;
            if (!token)
                throw new common_1.UnauthorizedException('Token Missing');
            try {
                jwt.verify(token, this.JWT_SECRET);
                return res.status(200).json({ valid: true, message: "Token is valid" });
            }
            catch (error) {
                return res.status(401).json({ valid: false, message: "Invalid Token" });
            }
        });
    }
    // ─────────────────────────────────────────────────────────────────────────────
    /**
     * @brief This function handles user signout requests.
     * @param decodedPayload The decoded payload.
     * @param res The response object.
     * @return The result of the signout operation.
     */
    signout(decodedPayload, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // Clear the JWT cookie or session
            if (!decodedPayload)
                return;
            try {
                res.clearCookie('token');
                res.clearCookie('refreshToken');
                this.updateUserLoggedIn(decodedPayload.sub, false);
                return res.status(200).send({ message: 'Signed out successfully' });
            }
            catch (error) {
                console.error(error);
                return res.status(401).send({ message: "Cookie not found" });
            }
        });
    }
    // ─────────────────────────────────────────────────────────────────────────────
    /**
     * @brief This function signs a token for 42 authentication.
     * @param req The request object.
     * @param res The response object.
     */
    signToken42(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const code = req.query['code'];
                const token = yield this.exchangeCodeForToken(code);
                if (!token) {
                    console.error('Failed to fetch access token');
                    throw new Error('Failed to fetch access token');
                }
                const userInfo = yield this.getUserInfo(token);
                const user = yield this.createUser(userInfo, res);
                if (user.TwoFA == true) {
                }
                // Set both JWT token and refresh token as cookies
                const payload = {
                    sub: user.id,
                    username: user.username,
                };
                const secret = this.JWT_SECRET;
                const jwtToken = yield this.jwt.signAsync(payload, {
                    expiresIn: '15m',
                    secret: secret,
                });
                const refreshToken = yield this.createRefreshToken(user.id);
                res.cookie('token', jwtToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'none',
                    maxAge: 1000 * 60 * 15 // 15 minutes in milliseconds
                });
                res.cookie('refreshToken', refreshToken.token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'none',
                    maxAge: 1000 * 60 * 60 * 24 * 30 // 30 days in milliseconds
                });
                // Redirect the user to the desired URL after successful authentication
                res.redirect('http://localhost:8081/home');
            }
            catch (error) {
                console.error('Error in signToken42:', error);
                // Handle errors here, e.g., return an error response
                throw new common_1.InternalServerErrorException('Internal server error');
            }
        });
    }
    // ─────────────────────────────────────────────────────────────────────────────
    /**
     * @brief This function exchanges a code for a token.
     * @param code The code.
     * @return The token or null if the exchange fails.
     */
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
    // ─────────────────────────────────────────────────────────────────────────────
    sendAuthorizationCodeRequest(code) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestBody = {
                grant_type: 'authorization_code',
                client_id: process.env.UID_42,
                client_secret: process.env.SECRET_42,
                code: code,
                redirect_uri: 'http://localhost:4000/api/auth/callback42',
            };
            return axios_1.default.post('https://api.intra.42.fr/oauth/token', null, { params: requestBody });
        });
    }
    // ─────────────────────────────────────────────────────────────────────────────
    /**
     * @brief This function creates a user.
     * @param userInfo The user info.
     * @param res The response object.
     * @return The user.
     */
    getUserInfo(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.sendUserInfoRequest(token);
                return response.data;
            }
            catch (error) {
                console.error('Error fetching user info:', error);
                throw error;
            }
        });
    }
    // ─────────────────────────────────────────────────────────────────────────────
    sendUserInfoRequest(token) {
        return __awaiter(this, void 0, void 0, function* () {
            return axios_1.default.get('https://api.intra.42.fr/v2/me', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        });
    }
    // ─────────────────────────────────────────────────────────────────────────────
    /**
     * @brief This function creates a user.
     * @param userInfo The user info.
     * @param res The response object.
     * @return The user.
     */
    createUser(userInfo, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield this.prisma.user.findUnique({
                where: {
                    id: userInfo.id,
                },
            });
            if (existingUser) {
                console.log('User already exists:', existingUser);
                //   return "User already exists";
                existingUser.firstConnexion = false;
                return existingUser;
            }
            try {
                let avatarUrl;
                if (userInfo.image.link !== null) {
                    // use the 42 profile picture if not null
                    avatarUrl = userInfo.image.link;
                }
                const user = yield this.prisma.user.create({
                    data: {
                        id: userInfo.id,
                        hashPassword: this.generateRandomPassword(),
                        username: userInfo.login,
                        avatar: userInfo.image.link,
                    },
                });
                const { secret, otpauthUrl } = this.generateTwoFASecret(user.id);
                user.twoFASecret = secret;
                user.twoFAUrl = otpauthUrl;
                console.log("User created", user);
                return user;
            }
            catch (error) {
                console.error('Error saving user information to database:', error);
                throw error;
            }
        });
    }
    // ─────────────────────────────────────────────────────────────────────────────
    /**
     * @brief This function generates a random password.
     * @return The password.
     */
    generateRandomPassword() {
        const password = Math.random().toString(36).slice(2, 15) +
            Math.random().toString(36).slice(2, 15);
        return password;
    }
    // ─────────────────────────────────────────────────────────────────────
    /**
     * @brief This function generates a 2FA secret.
     * @param userId The user's ID.
     * @return The 2FA secret and otpauth URL.
     */
    generateTwoFASecret(userId) {
        const secret = speakeasy.generateSecret({ length: 20 }); // Generate a 20-character secret
        const otpauthUrl = speakeasy.otpauthURL({
            secret: secret.base32,
            label: `ft_transcendance:${userId}`,
            issuer: 'ft_transcendance', // Customize the issuer as needed
        });
        return { secret: secret.base32, otpauthUrl };
    }
    // ─────────────────────────────────────────────────────────────────────────────
    /**
     * @brief This function verifies a 2FA code.
     * @param userId The user's ID.
     * @param code The 2FA code.
     * @return Whether the 2FA code is verified.
     */
    verifyTwoFACode(userId, code) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.prisma.user.findUnique({
                where: {
                    id: userId,
                },
            });
            if (!user) {
                throw new Error('User not found');
            }
            const verified = speakeasy.totp.verify({
                secret: user.twoFASecret || '',
                encoding: 'base32',
                token: code,
            });
            return verified;
        });
    }
    // ─────────────────────────────────────────────────────────────────────────────
    /**
     * @brief This function enables 2FA.
     * @param userId The user's ID.
     */
    enable2FA(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.prisma.user.update({
                where: { id: userId },
                data: {
                    TwoFA: true,
                },
            });
        });
    }
};
exports.AuthService = AuthService;
__decorate([
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthService.prototype, "signToken42", null);
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
