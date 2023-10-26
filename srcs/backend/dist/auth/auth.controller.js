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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const dto_1 = require("./dto");
const public_decorators_1 = require("../decorators/public.decorators");
const extract_jwt_decorator_1 = require("../decorators/extract-jwt.decorator");
const browserError = "This browser session is already taken by someone," +
    " please open a new browser or incognito window";
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    // ─────────────────────────────────────────────────────────────────────────────
    getToken(req) {
        return __awaiter(this, void 0, void 0, function* () {
            // Extract the access token from the request cookies
            const accessToken = req.cookies['token'];
            return { accessToken };
        });
    }
    // ─────────────────────────────────────────────────────────────────────────────
    signup(dto, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.authService.signup(dto, res);
                res.status(result.statusCode).send({ valid: result.valid, message: result.message });
            }
            catch (error) {
                res.status(500).send({ valid: false, message: error });
            }
        });
    }
    // ─────────────────────────────────────────────────────────────────────────────
    signin(dto, res, req) {
        return __awaiter(this, void 0, void 0, function* () {
            if (req.cookies.token)
                return res.status(400).send({ valid: false, message: browserError });
            try {
                const result = yield this.authService.signin(dto, res);
                res.status(200).send({ valid: result.valid, message: result.message });
            }
            catch (error) {
                console.log(error);
                res.status(500).send({ valid: false, message: error });
            }
        });
    }
    // ─────────────────────────────────────────────────────────────────────────────
    checkTokenValidity(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.authService.checkTokenValidity(req, res);
        });
    }
    // ─────────────────────────────────────────────────────────────────────────────
    signout(decodedPayload, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!decodedPayload) {
                console.error("error decoding payload with decorator\n");
                return;
            }
            return this.authService.signout(decodedPayload, res);
        });
    }
    // ─────────────────────────────────────────────────────────────────────────────
    get42Url() {
        return __awaiter(this, void 0, void 0, function* () {
            const url = "https://api.intra.42.fr/oauth/authorize?client_id=" + process.env.UID_42 + "&redirect_uri=" + process.env.REDIRECT_URI + "response_type=code";
            return (url);
        });
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // @Public()
    handle42Callback(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("test");
            try {
                // Call the authService to handle 42 authentication
                yield this.authService.signToken42(req, res);
            }
            catch (error) {
                console.error(error);
                // Handle errors here and redirect as needed
                res.redirect('/error2');
            }
        });
    }
    // ─────────────────────────────────────────────────────────────────────────────
    enable2FA() {
        return __awaiter(this, void 0, void 0, function* () {
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
    (0, common_1.Post)('signin') // delete async, has to signin and cannot do anything else
    ,
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.AuthDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signin", null);
__decorate([
    (0, common_1.Get)('checkTokenValidity'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "checkTokenValidity", null);
__decorate([
    (0, common_1.Get)('signout'),
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
    (0, common_1.Post)('enable2FA'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "enable2FA", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
