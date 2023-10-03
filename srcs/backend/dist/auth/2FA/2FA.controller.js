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
exports.TwoFaController = void 0;
const common_1 = require("@nestjs/common");
const _2FA_service_1 = require("./2FA.service");
let TwoFaController = class TwoFaController {
    constructor(twoFaService) {
        this.twoFaService = twoFaService;
    }
    generateSecret(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { secret, otpauthUrl } = this.twoFaService.generateTwoFASecret(userId);
                return { secret, otpauthUrl };
            }
            catch (error) {
                if (error === 'User not found') {
                    throw new common_1.HttpException(error, common_1.HttpStatus.NOT_FOUND);
                }
                else if (error instanceof Error) {
                    throw new common_1.HttpException(error, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
                }
                else {
                    throw new common_1.HttpException('An unexpected error occurred.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }
        });
    }
    verifyCode(userId, body) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const isValid = yield this.twoFaService.verifyTwoFACode(userId, body.code);
                if (!isValid) {
                    throw new common_1.HttpException('Invalid code provided.', common_1.HttpStatus.BAD_REQUEST);
                }
                return { isValid };
            }
            catch (error) {
                if (error === 'User not found') {
                    throw new common_1.HttpException(error, common_1.HttpStatus.NOT_FOUND);
                }
                else if (error instanceof Error) {
                    throw new common_1.HttpException(error, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
                }
                else {
                    throw new common_1.HttpException('An unexpected error occurred.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }
        });
    }
    generateQrCode(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const otpauthUrl = this.twoFaService.generateOtpauthUrl(userId);
                const qrCodeDataURL = yield this.twoFaService.generateQrCode(otpauthUrl);
                return { qrCodeDataURL };
            }
            catch (error) {
                if (error === 'User not found') {
                    throw new common_1.HttpException(error, common_1.HttpStatus.NOT_FOUND);
                }
                else if (error instanceof Error) {
                    throw new common_1.HttpException(error, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
                }
                else {
                    throw new common_1.HttpException('An unexpected error occurred.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }
        });
    }
};
exports.TwoFaController = TwoFaController;
__decorate([
    (0, common_1.Get)('generate-secret/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TwoFaController.prototype, "generateSecret", null);
__decorate([
    (0, common_1.Post)('verify-code/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], TwoFaController.prototype, "verifyCode", null);
__decorate([
    (0, common_1.Get)('generate-qr-code/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TwoFaController.prototype, "generateQrCode", null);
exports.TwoFaController = TwoFaController = __decorate([
    (0, common_1.Controller)('2fa'),
    __metadata("design:paramtypes", [_2FA_service_1.TwoFaService])
], TwoFaController);
