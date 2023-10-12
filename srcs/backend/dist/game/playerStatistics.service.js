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
exports.playerStatistics = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let playerStatistics = class playerStatistics {
    constructor(prisma) {
        this.prisma = prisma;
    }
    addGamePlayedToUsers(idP1, idP2) {
        return __awaiter(this, void 0, void 0, function* () {
            const p1 = yield this.prisma.user.findUnique({
                where: {
                    id: idP1,
                },
            });
            const p2 = yield this.prisma.user.findUnique({
                where: {
                    id: idP2,
                },
            });
            console.log("2 players id: ", idP1, idP2);
            // @to-do throw exception if one of the 2 players is not found
            if (!p1 || !p2) {
                throw new Error("One of the players is not found.");
            }
            yield this.prisma.user.update({
                where: { id: idP1 },
                data: {
                    gamesPlayed: {
                        increment: 1,
                    },
                },
            });
            yield this.prisma.user.update({
                where: { id: idP2 },
                data: {
                    gamesPlayed: {
                        increment: 1,
                    },
                },
            });
        });
    }
    addWinToPlayer(playerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const player = yield this.prisma.user.findUnique({
                where: {
                    id: playerId,
                },
            });
            if (!player) {
                throw new Error("Player not found.");
            }
            yield this.prisma.user.update({
                where: { id: playerId },
                data: {
                    gamesWon: {
                        increment: 1,
                    },
                },
            });
        });
    }
    addGamePlayedToOneUser(playerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const player = yield this.prisma.user.findUnique({
                where: {
                    id: playerId,
                },
            });
            if (!player) {
                throw new Error("Player not found.");
            }
            yield this.prisma.user.update({
                where: { id: playerId },
                data: {
                    gamesPlayed: {
                        increment: 1,
                    },
                },
            });
        });
    }
};
exports.playerStatistics = playerStatistics;
exports.playerStatistics = playerStatistics = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], playerStatistics);
