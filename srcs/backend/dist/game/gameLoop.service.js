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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameLoopService = void 0;
const common_1 = require("@nestjs/common");
const gameLogic_service_1 = require("./gameLogic.service");
const gatewayOut_1 = require("./gatewayOut");
const lobbies_1 = require("./lobbies");
const data_1 = require("./data");
const RAY_LENGHT = 15 + 20;
const moveSpeed = 6 / 800.0;
let GameLoopService = class GameLoopService {
    constructor(gameLogicService, gatewayOut) {
        this.gameLogicService = gameLogicService;
        this.gatewayOut = gatewayOut;
        this.updateGameState = () => {
            this.gatewayOut.updateLobbiesGameState();
        };
        // printGameData() {
        //   // console.log("print 3: ", gameConfig.konvaHeight, gameConfig.konvaWidth);
        // }
        // private updateRay = () => {
        //   this.gameState.ballRay.x1 = this.gameState.ballState.ballPos.x;
        //   this.gameState.ballRay.y1 = this.gameState.ballState.ballPos.y;
        //   if (this.gameState.ballState.ballDirection === 'right') {
        //     this.gameState.ballRay.x2 = this.gameState.ballState.ballPos.x + RAY_LENGHT * Math.cos((0 * Math.PI) / 180);
        //     this.gameState.ballRay.y2 = this.gameState.ballState.ballPos.y + RAY_LENGHT * Math.sin((0 * Math.PI) / 180);
        //     return;
        //   }
        //   this.gameState.ballRay.x2 = this.gameState.ballState.ballPos.x - RAY_LENGHT * Math.cos((0 * Math.PI) / 180);
        //   this.gameState.ballRay.y2 = this.gameState.ballState.ballPos.y - RAY_LENGHT * Math.sin((0 * Math.PI) / 180);
        // }
        this.updateBall = () => {
            for (const [key, lobby] of lobbies_1.lobbies) {
                if (lobby.gameState.gameState.isPaused === true)
                    continue;
                const ballState = this.gameLogicService.ballMove(lobby.gameState.gameState.ballState.ballDirection, lobby.gameState.gameState.ballState.ballPos, lobby.gameState.gameState.p1pos, lobby.gameState.gameState.p2pos, lobby.gameState.gameState.ballState.ballDX, lobby.gameState.gameState.ballState.ballDY, lobby.gameState.gameState.score, lobby.gameState.gameState.ballRay);
                if (ballState) {
                    lobby.gameState.gameState.ballState = ballState;
                }
                const score = ballState === null || ballState === void 0 ? void 0 : ballState.scoreBoard;
                if (score)
                    lobby.gameState.gameState.score = score;
            }
        };
        this.gameLoopRunning = false;
    }
    startGameLoop() {
        if (this.gameLoopRunning) {
            return;
        }
        this.gameLoopRunning = true;
        this.gameLoop();
    }
    stopGameLoop() {
        this.gameLoopRunning = false;
        return;
    }
    gameLoop() {
        this.updateBall();
        this.updateGameState();
        if (this.gameLoopRunning) {
            setTimeout(() => {
                this.gameLoop();
            }, 1000 / 60);
            // }, 1000 / 60);
        }
    }
    findPlayerLobby(player) {
        var _a, _b;
        for (const [key, value] of lobbies_1.lobbies) {
            if (player.id === ((_a = value.player1) === null || _a === void 0 ? void 0 : _a.id) || player.id === ((_b = value.player2) === null || _b === void 0 ? void 0 : _b.id))
                return key;
        }
        return '-1';
    }
    updatePlayerPos(direction, player) {
        var _a;
        const lobbyId = this.findPlayerLobby(player);
        const lobby = lobbies_1.lobbies.get(lobbyId);
        if ((lobby === null || lobby === void 0 ? void 0 : lobby.gameState.gameState.isPaused) === true)
            return;
        if (!lobby)
            return;
        if (player.id === ((_a = lobby.player1) === null || _a === void 0 ? void 0 : _a.id)) {
            if (direction === 'up') {
                if (lobby.gameState.gameState.p1pos.y > 0) {
                    lobby.gameState.gameState.p1pos.y -= moveSpeed;
                }
            }
            else if (direction === 'down') {
                if (lobby.gameState.gameState.p1pos.y < 1 - data_1.gameConfig.paddleHeight) {
                    lobby.gameState.gameState.p1pos.y += moveSpeed;
                }
            }
        }
        else {
            if (direction === 'up') {
                if (lobby.gameState.gameState.p2pos.y > 0) {
                    lobby.gameState.gameState.p2pos.y -= moveSpeed;
                }
            }
            else if (direction === 'down') {
                if (lobby.gameState.gameState.p2pos.y < 1 - data_1.gameConfig.paddleHeight) {
                    lobby.gameState.gameState.p2pos.y += moveSpeed;
                }
            }
        }
    }
};
exports.GameLoopService = GameLoopService;
exports.GameLoopService = GameLoopService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [gameLogic_service_1.GameLogicService,
        gatewayOut_1.GatewayOut])
], GameLoopService);
