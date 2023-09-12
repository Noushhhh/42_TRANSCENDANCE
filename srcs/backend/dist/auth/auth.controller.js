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
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    signup(dto, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.authService.signup(dto, res);
        });
    }
    signin(dto, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.authService.signin(dto, res);
        });
    }
    checkTokenValidity(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("passing by checkTokenValidity");
            return this.authService.checkTokenValidity(req, res);
        });
    }
    signout(res) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.authService.signout(res);
        });
    }
    // change name to 42-callback 
    handle42Callback(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.authService.signToken42(req);
                if (user) {
                    res.redirect('/home'); // Redirect if the user is successfully created or authenticated
                }
                else {
                    console.error("error creating user"),
                        // Handle other cases if needed (e.g., "User already exists")
                        res.redirect('/error1'); // Redirect to an error page or handle accordingly
                }
            }
            catch (error) {
                console.error(error);
                // Handle errors here and redirect as needed
                res.redirect('/error2');
            }
        });
    }
};
exports.AuthController = AuthController;
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
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.AuthDto, Object]),
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
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signout", null);
__decorate([
    (0, common_1.Get)('token'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "handle42Callback", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
