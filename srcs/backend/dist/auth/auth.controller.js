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
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const all_exception_filter_1 = require("./exception/all-exception.filter");
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const dto_1 = require("./dto");
const public_decorators_1 = require("../decorators/public.decorators");
const express_1 = require("express");
const extract_jwt_decorator_1 = require("../decorators/extract-jwt.decorator");
const dto_2 = require("../users/dto");
const common_2 = require("@nestjs/common");
const guards_1 = require("./guards");
const browserError = "This browser session is already taken by someone," + " please open a new browser or incognito window";
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    getToken(req) {
        return __awaiter(this, void 0, void 0, function* () {
            // Extract the access token from the request cookies
            const accessToken = req.cookies['token'];
            return { accessToken };
        });
    }
    signup(dto, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.authService.signup(dto, res);
        });
    }
    signin(dto, res, req) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("passing in signin service");
            return yield this.authService.signin(dto, res, req);
        });
    }
    checkTokenValidity(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.authService.checkTokenValidity(req, res);
        });
    }
    refreshToken(decodedPayload, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!decodedPayload) {
                    throw new common_1.BadRequestException('Access token not found in cookies');
                }
                const result = yield this.authService.signToken(decodedPayload.sub, decodedPayload.email, res);
                return res.status(result.statusCode).send({ valid: result.valid, message: result.message });
            }
            catch (error) {
                console.error();
                throw new Error(`Error in refreshToken controller: ${error}`);
            }
        });
    }
    signout(decodedPayload, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!decodedPayload) {
                console.error("error decoding payload with decorator\n");
                return;
            }
            return this.authService.signout(decodedPayload.sub, res);
        });
    }
    get42Url() {
        return __awaiter(this, void 0, void 0, function* () {
            const url = "https://api.intra.42.fr/oauth/authorize?client_id=" + process.env.UID_42 + "&redirect_uri=" + process.env.REDIRECT_URI + "&response_type=code";
            return (url);
        });
    }
    // @Public()
    handle42Callback(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Call the authService to handle 42 authentication
                yield this.authService.signToken42(req, res);
            }
            catch (error) {
                console.error(error);
                // // Handle errors here and redirect as needed
                // res.redirect('http://localhost:8081/error');
                throw error;
            }
        });
    }
    enable2FA(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // @to-do Mettre ca dans un trycatch car la fonction peut renvoyer execp
            const qrcodeUrl = yield this.authService.enable2FA(userId.userId);
            return { qrcode: qrcodeUrl };
        });
    }
    disable2FA(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.authService.disable2FA(userId.userId);
                return { res: true };
            }
            catch (error) {
                throw error;
            }
        });
    }
    validating2FA(TwoFAData) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.authService.validateTwoFA(TwoFAData.userId, TwoFAData.token);
            return { res: res };
        });
    }
    verifyTwoFACode(TwoFAData, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.authService.verifyTwoFACode(TwoFAData.userId, TwoFAData.token, response);
            return { res: res };
        });
    }
    is2FaActivated(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.headers['x-user-id'];
            if (typeof userId === 'string') {
                const userIdInt = parseInt(userId);
                const is2FaEnabled = yield this.authService.is2FaEnabled(userIdInt);
                return { res: is2FaEnabled };
            }
            throw new common_1.BadRequestException("Error trying to parse userID");
        });
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Get)('token'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_a = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _a : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getToken", null);
__decorate([
    (0, public_decorators_1.Public)(),
    (0, common_1.Post)('signup'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.AuthDto, typeof (_b = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signup", null);
__decorate([
    (0, public_decorators_1.Public)(),
    (0, common_1.Post)('signin'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.AuthDto, typeof (_c = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _c : Object, typeof (_d = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signin", null);
__decorate([
    (0, common_2.UseGuards)(guards_1.JwtAuthGuard) // Ensure the user is authenticated
    ,
    (0, common_1.Get)('checkTokenValidity'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _e : Object, typeof (_f = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _f : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "checkTokenValidity", null);
__decorate([
    (0, common_2.UseGuards)(guards_1.JwtAuthGuard) // Ensure the user is authenticated
    ,
    (0, common_1.Post)('refreshToken'),
    __param(0, (0, extract_jwt_decorator_1.ExtractJwt)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_g = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _g : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Delete)('signout'),
    __param(0, (0, extract_jwt_decorator_1.ExtractJwt)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_h = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _h : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signout", null);
__decorate([
    (0, public_decorators_1.Public)(),
    (0, common_1.Get)('42Url'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "get42Url", null);
__decorate([
    (0, common_1.Get)('callback42'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_j = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _j : Object, typeof (_k = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _k : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "handle42Callback", null);
__decorate([
    (0, common_1.Post)('enable2FA'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_2.UserIdDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "enable2FA", null);
__decorate([
    (0, common_1.Post)('disable2FA'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_2.UserIdDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "disable2FA", null);
__decorate([
    (0, common_1.Post)('validating2FA'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_2.TwoFADataDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "validating2FA", null);
__decorate([
    (0, common_1.Post)('verifyTwoFACode'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_2.TwoFADataDto, typeof (_l = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _l : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyTwoFACode", null);
__decorate([
    (0, common_1.Get)('is2FaActivated'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_m = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _m : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "is2FaActivated", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.UseFilters)(all_exception_filter_1.AllExceptionsFilter),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
