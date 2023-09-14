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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
// import { User, Bookmark } from  '@prisma/client';
const prisma_service_1 = require("../prisma/prisma.service");
const runtime_1 = require("@prisma/client/runtime");
const argon = __importStar(require("argon2"));
let AuthService = class AuthService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    signup(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            // generate password hash
            const hashPassword = yield argon.hash(dto.password);
            // save user in db
            try {
                const user = yield this.prisma.user.create({
                    data: {
                        username: dto.username,
                        hashPassword,
                    },
                    select: {
                        username: true, // return only username and not hash pwd
                    }
                });
                // return saved user
                return user;
            }
            catch (error) {
                // handle parsing errors
                if (error instanceof runtime_1.PrismaClientKnownRequestError &&
                    error.code === 'P2002' // try to create new record with unique field
                ) {
                    // throw new Error('Username already in use');
                    throw new common_1.ForbiddenException("Username already in use");
                }
                // handle other errors
                throw error;
            }
        });
    }
    signin(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            // find user with username
            const user = yield this.prisma.user.findUnique({
                where: {
                    username: dto.username,
                }
            });
            // if user not found throw exception
            if (!user)
                throw new common_1.ForbiddenException('Username not found');
            // compare password
            const passwordMatch = yield argon.verify(user.hashPassword, dto.password);
            // if password wrong throw exception
            if (!passwordMatch)
                throw new common_1.ForbiddenException('Incorrect password');
            // send back the user
            // delete user.hashPassword
            return user;
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthService);
