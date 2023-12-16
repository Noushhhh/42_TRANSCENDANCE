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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const users_service_1 = require("../users/users.service");
const jwt_1 = require("@nestjs/jwt");
const constants_1 = require("../auth/constants/constants");
const argon = __importStar(require("argon2"));
const crypto_1 = require("crypto");
const jwt = __importStar(require("jsonwebtoken"));
const axios_1 = __importDefault(require("axios"));
const speakeasy = __importStar(require("speakeasy"));
const uuid_1 = require("uuid");
const qrcode_1 = __importDefault(require("qrcode"));
const has_message_tools_1 = require("../tools/has-message.tools");
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
let AuthService = AuthService_1 = class AuthService {
    constructor(usersService, prisma, jwt) {
        this.usersService = usersService;
        this.prisma = prisma;
        this.jwt = jwt;
        this.logger = new common_1.Logger(AuthService_1.name);
        this.currentUser = null;
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
            return res.status(201).send({ valid: true, message: "user was create successfully" });
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
            try {
                const user = yield this.usersService.findUserWithUsername(dto.username);
                if (!user)
                    return res.status(common_1.HttpStatus.NOT_FOUND).send({ message: 'User not found' });
                /*  At this point, if the user sends a signin request, that means whether his token is expired
                    or he is not logged in(there is no cookies trace session in the browser), as in the fronted
                    "SignIn component" we are checking at component mount, if the user is authenticated using cookies or not,
                    before sending a request to backend */
                if (req.cookies['userSession']) {
                    //so If we arreve here, the token is expired. So, we clear the session cookies and user session from database.
                    yield this.signout(user.id, res);
                }
                const passwordMatch = yield argon.verify(user.hashPassword, dto.password);
                if (!passwordMatch)
                    return res.status(common_1.HttpStatus.UNAUTHORIZED).send({ message: 'Incorrect password' });
                // Enhanced session check logic
                if (user.sessionExpiresAt && new Date(user.sessionExpiresAt) > new Date())
                    return res.status(common_1.HttpStatus.CONFLICT).send({ message: 'User is already logged in' });
                // Check if 2FA (Two-Factor Authentication) is enabled for the user
                yield this.handleTwoFactorAuthentication(user, res);
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    // ─────────────────────────────────────────────────────────────────────────────
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
                throw new common_1.HttpException('Failed to find or create refresh token for user' + ((0, has_message_tools_1.hasMessage)(error) ? error.message : ''), common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        });
    }
    // ─────────────────────────────────────────────────────────────────────────────
    /**
     * Generates JWT and refresh tokens for a user and updates session information in the database.
     * @param userId - The ID of the user.
     * @param email - The email of the user.
     * @returns An object containing the generated JWT and refresh tokens, along with their expiration information.
     */
    generateTokens(userId, email) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = { sub: userId, email };
            const secret = this.JWT_SECRET;
            const tokenExpiration = process.env.JWT_EXPIRATION || '15m';
            let token, tokenExpiresAt;
            try {
                token = yield this.jwt.signAsync(payload, { expiresIn: tokenExpiration, secret });
                tokenExpiresAt = new Date(Date.now() + this.convertToMilliseconds(tokenExpiration));
            }
            catch (error) {
                throw new common_1.HttpException("Error generating JWT token: " + ((0, has_message_tools_1.hasMessage)(error) ? error.message : ''), common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            let refreshToken;
            try {
                refreshToken = yield this.refreshTokenIfNeeded(userId);
            }
            catch (error) {
                throw new common_1.HttpException("Error generating refresh token: " + ((0, has_message_tools_1.hasMessage)(error) ? error.message : ''), common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            const sessionId = this.generateSessionId();
            const sessionExpiresAt = tokenExpiresAt;
            try {
                yield this.prisma.user.update({
                    where: { id: userId },
                    data: { sessionId, sessionExpiresAt },
                });
            }
            catch (error) {
                throw new common_1.HttpException("Error updating user session in database: " + ((0, has_message_tools_1.hasMessage)(error) ? error.message : ''), common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            let newToken = { token, expiresAt: tokenExpiresAt };
            return { newToken, refreshToken };
        });
    }
    // ─────────────────────────────────────────────────────────────────────────────
    /**
     * Sets JWT and refresh tokens in HTTP-only cookies on the response object.
     * @param tokens - Object containing the JWT token and refresh token with their expiration times.
     * @param res - HTTP response object to set cookies on.
     */
    setTokens(tokens, res) {
        // Error handling for undefined tokens
        if (!tokens || !tokens.newToken.token || !tokens.refreshToken || !tokens.refreshToken.token) {
            return res.status(common_1.HttpStatus.CONFLICT).send({ message: 'Problem creating refresh token for user' });
        }
        // Set refresh token cookie
        const refreshTokenMaxAge = tokens.refreshToken.expiresAt.getTime() - Date.now();
        res.cookie('refreshToken', tokens.refreshToken.token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: refreshTokenMaxAge
        });
        // Assuming the JWT token also has an expiresAt property to calculate its maxAge
        const tokenMaxAge = tokens.newToken.expiresAt.getTime() - Date.now(); // tokens.newToken.tokenExpiresAt needs to be provided
        res.cookie('token', tokens.newToken.token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: tokenMaxAge
        });
        const sessionValue = this.generateSessionId(); // Or another method to generate session identifier
        // Set the session cookie in the response
        res.cookie('userSession', sessionValue, {
            httpOnly: true, // Makes the cookie inaccessible to client-side scripts
            secure: process.env.NODE_ENV === 'production', // Ensures cookie is sent over HTTPS
            sameSite: 'strict', // Controls whether the cookie is sent with cross-origin requests
            maxAge: tokenMaxAge // Sets the cookie to expire in 1 day (example)
        });
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
            try {
                const { newToken, refreshToken } = yield this.generateTokens(userId, email);
                this.setTokens({ newToken, refreshToken }, res);
                if (!refreshToken) {
                    return res.status(common_1.HttpStatus.CONFLICT).send({ message: 'Problem creating refresh token for user' });
                }
                return ({ statusCode: 200, valid: true, message: "Authentication successful" });
            }
            catch (error) {
                this.logger.error(`Fail to signToken ${(0, has_message_tools_1.hasMessage)(error) ? error.message : ""}`);
                return null;
            }
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
                this.logger.error(`Failed to create refresh token for user ${userId}`, error);
                throw new common_1.ConflictException('Failed to create refresh token');
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
                return res.status(200).send({ valid: true, message: "Token is valid" });
            }
            catch (error) {
                return res.status(401).send({ valid: false, message: "Invalid Token" });
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
    signout(userId, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("passing by signout");
                yield this.prisma.user.update({
                    where: { id: userId },
                    data: { sessionId: null, sessionExpiresAt: null },
                });
                // Clear the JWT cookie or session
                res.clearCookie('token');
                res.clearCookie('refreshToken');
                res.clearCookie('userSession');
                return res.status(200).send({ message: 'Signed out successfully' });
            }
            catch (error) {
                console.error(error);
                throw error;
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
                // Extract the 'code' from the query parameters
                const code = req.query['code'];
                console.log(`passing by singToken42 req.query['code']: ${code}`);
                // Exchange the code for a token
                const token = yield this.exchangeCodeForToken(code);
                // Check if the token was successfully retrieved
                if (!token) {
                    console.error('Failed to fetch access token');
                    throw new Error('Failed to fetch access token');
                }
                // Retrieve user information using the token
                const userInfo = yield this.getUserInfo(token);
                // Create a new user or update existing user with the retrieved information
                const user = yield this.createUser(userInfo, res);
                // Check if the user session already exists
                if (req.cookies['userSession']) {
                    // If the session exists, it means the token is expired. 
                    // Clear the session cookies and user session from the database.
                    yield this.signout(user.id, res);
                }
                // Enhanced session check logic: check if the user is already logged in
                if (user.sessionExpiresAt && new Date(user.sessionExpiresAt) > new Date()) {
                    throw new common_1.ForbiddenException('User is already logged in');
                }
                // Check if 2FA (Two-Factor Authentication) is enabled for the user
                yield this.handleTwoFactorAuthentication(user, res);
            }
            catch (error) {
                // Log and handle any errors that occur during the process
                console.error('Error in signToken42:', error);
                throw error;
            }
        });
    }
    // ─────────────────────────────────────────────────────────────────────────────
    handleTwoFactorAuthentication(user, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if 2FA (Two-Factor Authentication) is enabled for the user
            if ((yield this.is2FaEnabled(user.id)) === false) {
                console.log(`Passing by 2FA is not activated`);
                // If 2FA is not enabled, proceed to sign the token
                const result = yield this.signToken(user.id, user.username, res);
                // Validate the result of token signing
                if (!result.valid) {
                    return res.status(common_1.HttpStatus.UNAUTHORIZED).send({ message: 'Invalid credentials' });
                }
                // Send a successful response
                res.status(common_1.HttpStatus.OK).send({ valid: result.valid, message: result.message, userId: null });
            }
            else {
                // If 2FA is enabled, indicate that in the response
                res.status(common_1.HttpStatus.OK).send({ valid: true, message: "2FA", userId: user.id });
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
                console.log(`passing by exchangeCodeForToken:  ${response} = await this.sendAuthorizationCodeRequest(code)`);
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
            try {
                const requestBody = {
                    grant_type: 'authorization_code',
                    client_id: process.env.UID_42,
                    client_secret: process.env.SECRET_42,
                    code: code,
                    redirect_uri: 'http://localhost:8081/callback42',
                };
                return axios_1.default.post('https://api.intra.42.fr/oauth/token', null, { params: requestBody });
            }
            catch (error) {
                throw error;
            }
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
                const avatarFile = yield this.usersService.downloadFile(avatarUrl);
                const user = yield this.prisma.user.create({
                    data: {
                        id: userInfo.id,
                        hashPassword: this.generateRandomPassword(),
                        username: userInfo.login,
                        avatar: null,
                    },
                });
                yield this.usersService.updateAvatar(user.id, avatarFile);
                const { secret, otpauthUrl } = this.generateTwoFASecret(user.id);
                user.twoFASecret = secret;
                user.twoFAUrl = otpauthUrl;
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
        const secret = speakeasy.generateSecret();
        return { secret: secret.base32, otpauthUrl: secret.otpauth_url };
    }
    // ─────────────────────────────────────────────────────────────────────────────
    /**
     * @brief This function verifies a 2FA code.
     * @param userId The user's ID.
     * @param code The 2FA code.
     * @return Whether the 2FA code is verified.
     */
    verifyTwoFACode(userId, code, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.prisma.user.findUnique({
                    where: {
                        id: userId,
                    },
                });
                if (!user) {
                    throw new common_1.NotFoundException('User not found');
                }
                if (!user.twoFASecret)
                    return false;
                const verified = speakeasy.totp.verify({
                    secret: user.twoFASecret,
                    encoding: 'base32',
                    token: code,
                });
                if (!verified) {
                    console.error(`Passing by verifyTwoFAcode vefied: ${verified}`);
                    throw new common_1.ForbiddenException('Provided code couldn\'d be verified');
                }
                if (verified === true) {
                    const result = yield this.signToken(user.id, user.username, res);
                    if (!result.valid) {
                        // Consider providing more detailed feedback based on the error
                        throw new common_1.ForbiddenException('Authentication failed');
                    }
                    res.status(200).send({ valid: result.valid, message: result.message, userId: null });
                }
                return verified;
            }
            catch (error) {
                throw error;
            }
        });
    }
    validateTwoFA(userId, code) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.prisma.user.findUnique({
                where: {
                    id: userId,
                },
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            const secret = user.twoFASecret;
            if (!secret)
                return false;
            const verified = speakeasy.totp.verify({
                secret,
                encoding: 'base32',
                token: code
            });
            if (verified === true) {
                yield this.prisma.user.update({
                    where: { id: userId },
                    data: {
                        TwoFA: true,
                    },
                });
            }
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
            const { secret, otpauthUrl } = this.generateTwoFASecret(userId);
            // @to-do CHECK SI LE USER EXIST 
            yield this.prisma.user.update({
                where: { id: userId },
                data: {
                    TwoFA: false,
                    twoFASecret: secret,
                },
            });
            const generateQR = (otpauthUrl) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const url = yield qrcode_1.default.toDataURL(otpauthUrl);
                    return url;
                }
                catch (err) {
                    console.error(err);
                }
            });
            const QRUrl = yield generateQR(otpauthUrl);
            if (QRUrl)
                return QRUrl;
            return "";
        });
    }
    disable2FA(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.prisma.user.findUnique({
                where: {
                    id: userId,
                },
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            yield this.prisma.user.update({
                where: { id: userId },
                data: {
                    twoFASecret: null,
                    TwoFA: false,
                },
            });
        });
    }
    is2FaEnabled(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.prisma.user.findUnique({
                where: {
                    id: userId,
                },
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            return user.TwoFA;
        });
    }
    // Method to generate a unique session identifier
    generateSessionId() {
        return (0, uuid_1.v4)(); // Generates and returns a new UUID (v4)
    }
    convertToMilliseconds(timeStr) {
        const timeValue = parseInt(timeStr.slice(0, -1), 10);
        const timeUnit = timeStr.slice(-1);
        switch (timeUnit) {
            case 'd': // Days
                return timeValue * 24 * 60 * 60 * 1000;
            case 'h': // Hours
                return timeValue * 60 * 60 * 1000;
            case 'm': // Minutes
                return timeValue * 60 * 1000;
            case 's': // Seconds
                return timeValue * 1000;
            default:
                throw new Error(`Unsupported time format: ${timeStr}`);
        }
    }
};
exports.AuthService = AuthService;
__decorate([
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthService.prototype, "signToken42", null);
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
