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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const user_service_1 = require("./user.service");
const extract_jwt_decorator_1 = require("../auth/decorators/extract-jwt.decorator");
let UserController = class UserController {
    constructor(userService) {
        this.userService = userService;
    }
    createOrUpdateProfile(profileImage, req, decodedPayload, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!decodedPayload) {
                console.error('Unable to decode token in createOrUpdateProfile controller in user module\n');
                return res.status(401).json({ valid: false, message: "Unable to decode token in usermodule" });
            }
            const { profileName } = req.body;
            // const userCookie = req.cookies['token'];
            console.log("passing by user controller" + `\n decoded email: ${decodedPayload.email} \n profile name : ${profileName}\n`);
            const result = yield this.userService.handleProfileSetup(decodedPayload, profileName, profileImage);
            return res.status(result === null || result === void 0 ? void 0 : result.statusCode).json({ valid: result.valid, message: result.message });
        });
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Post)('update'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('profileImage')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, extract_jwt_decorator_1.ExtractJwt)()),
    __param(3, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "createOrUpdateProfile", null);
exports.UserController = UserController = __decorate([
    (0, common_1.Controller)('user'),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
