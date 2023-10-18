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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameController = void 0;
const common_1 = require("@nestjs/common");
const gameLoop_service_1 = require("./gameLoop.service");
const gameLobby_service_1 = require("./gameLobby.service");
const common_2 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt.auth-guard");
const express_1 = require("express");
const playerStatistics_service_1 = require("./playerStatistics.service");
let GameController = class GameController {
    constructor(gameLoopService, gameLobby, playerStats) {
        this.gameLoopService = gameLoopService;
        this.gameLobby = gameLobby;
        this.playerStats = playerStats;
    }
    connectToLobby(clientId, req) {
        if (req.user) {
            this.gameLobby.addPlayerToLobby(clientId, req.user.id);
        }
        return { test: 'player connected to lobby' };
    }
    addGameToPlayer(req) {
        var _a;
        if (req.user)
            this.playerStats.addGamePlayedToOneUser((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
        return { msg: 'player games incremented' };
    }
    play() {
        this.gameLoopService.startGameLoop();
        return { msg: 'started' };
    }
    stop() {
        this.gameLoopService.stopGameLoop();
        return { msg: 'stopped' };
    }
};
exports.GameController = GameController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('lobby'),
    __param(0, (0, common_2.Query)('clientId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_a = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _a : Object]),
    __metadata("design:returntype", void 0)
], GameController.prototype, "connectToLobby", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('addGameToPlayer'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], GameController.prototype, "addGameToPlayer", null);
__decorate([
    (0, common_1.Get)('play'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GameController.prototype, "play", null);
__decorate([
    (0, common_1.Get)('stop'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GameController.prototype, "stop", null);
exports.GameController = GameController = __decorate([
    (0, common_1.Controller)('game'),
    __metadata("design:paramtypes", [gameLoop_service_1.GameLoopService,
        gameLobby_service_1.GameLobbyService,
        playerStatistics_service_1.playerStatistics])
], GameController);
