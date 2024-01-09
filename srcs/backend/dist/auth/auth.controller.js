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
var AuthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const dto_1 = require("./dto");
const public_decorators_1 = require("../decorators/public.decorators");
const extract_jwt_decorator_1 = require("../decorators/extract-jwt.decorator");
const dto_2 = require("../users/dto");
const common_2 = require("@nestjs/common");
const guards_1 = require("./guards");
const browserError = "This browser session is already taken by someone," + " please open a new browser or incognito window";
let AuthController = AuthController_1 = class AuthController {
    constructor(authService) {
        this.authService = authService;
        this.logger = new common_1.Logger(AuthController_1.name);
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
            const result = yield this.authService.signToken(decodedPayload.sub, decodedPayload.email, res);
            if (!result) {
                return res.status(common_1.HttpStatus.FORBIDDEN).json({
                    statusCode: common_1.HttpStatus.FORBIDDEN,
                    message: 'Not able to refresh token',
                    error: 'FORBIDDEN'
                });
            }
            return res.status(result.statusCode).json({ valid: result.valid, message: result.message });
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
            yield this.authService.signToken42(req, res);
        });
    }
    enable2FA(decodedPayload, response) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.authService.enable2FA(decodedPayload.sub, response);
        });
    }
    disable2FA(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id))
                throw new common_1.NotFoundException("User not found");
            try {
                yield this.authService.disable2FA(req.user.id);
                res.status(common_1.HttpStatus.OK).json({ statusCode: common_1.HttpStatus.OK });
            }
            catch (error) {
                res.status(common_1.HttpStatus.NOT_FOUND).json({ statusCode: common_1.HttpStatus.NOT_FOUND, message: "User not found", error: "Not Found" });
            }
        });
    }
    validating2FA(decodedPayload, TwoFAData, response) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.authService.validateTwoFA(decodedPayload.sub, TwoFAData.token, response);
        });
    }
    verifyTwoFACode(data, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.authService.verifyTwoFACode(data.userId, data.token, response);
            res.status(common_1.HttpStatus.OK).json({ statusCode: common_1.HttpStatus.OK });
        });
    }
    is2FaActivated(decodedPayload, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield this.authService.is2FaEnabled(decodedPayload.sub);
                response.status(common_1.HttpStatus.OK).json({ statusCode: common_1.HttpStatus.OK, res: res });
            }
            catch (error) {
                this.logger.error(error);
            }
        });
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Get)('token'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getToken", null);
__decorate([
    (0, public_decorators_1.Public)(),
    (0, common_1.Post)('signup'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.AuthDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signup", null);
__decorate([
    (0, public_decorators_1.Public)(),
    (0, common_1.Post)('signin'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.AuthDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signin", null);
__decorate([
    (0, common_2.UseGuards)(guards_1.JwtAuthGuard) // Ensure the user is authenticated
    ,
    (0, common_1.Get)('checkTokenValidity'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "checkTokenValidity", null);
__decorate([
    (0, common_2.UseGuards)(guards_1.JwtAuthGuard) // Ensure the user is authenticated
    ,
    (0, common_1.Post)('refreshToken'),
    __param(0, (0, extract_jwt_decorator_1.ExtractJwt)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Delete)('signout'),
    __param(0, (0, extract_jwt_decorator_1.ExtractJwt)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
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
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "handle42Callback", null);
__decorate([
    (0, common_2.UseGuards)(guards_1.JwtAuthGuard),
    (0, common_1.Post)('enable2FA'),
    __param(0, (0, extract_jwt_decorator_1.ExtractJwt)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "enable2FA", null);
__decorate([
    (0, common_2.UseGuards)(guards_1.JwtAuthGuard),
    (0, common_1.Post)('disable2FA'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "disable2FA", null);
__decorate([
    (0, common_2.UseGuards)(guards_1.JwtAuthGuard),
    (0, common_1.Post)('validating2FA'),
    __param(0, (0, extract_jwt_decorator_1.ExtractJwt)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_2.TwoFADataDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "validating2FA", null);
__decorate([
    (0, common_1.Post)('verifyTwoFACode'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_2.TwoFaUserIdDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyTwoFACode", null);
__decorate([
    (0, common_2.UseGuards)(guards_1.JwtAuthGuard),
    (0, common_1.Get)('is2FaActivated'),
    __param(0, (0, extract_jwt_decorator_1.ExtractJwt)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "is2FaActivated", null);
exports.AuthController = AuthController = AuthController_1 = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
