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
const KONVA_WIDTH = 1200;
const KONVA_HEIGHT = 800;
const PADDLE_WIDTH = 25;
let GameLoopService = exports.GameLoopService = class GameLoopService {
    constructor(gameLogicService, gatewayOut) {
        this.gameLogicService = gameLogicService;
        this.gatewayOut = gatewayOut;
        this.ballPos = {
            x: KONVA_WIDTH / 2,
            y: KONVA_HEIGHT / 2,
        };
        this.gameState = {
            p1pos: {
                x: 10,
                y: 310,
            },
            p2pos: {
                x: KONVA_WIDTH - 10 - PADDLE_WIDTH,
                y: 310,
            },
            ballPos: {
                x: KONVA_WIDTH / 2,
                y: KONVA_HEIGHT / 2,
            },
            isPaused: true,
            score: {
                p1Score: 0,
                p2Score: 0,
            },
        };
        this.ballState = {
            ballDirection: 'left',
            ballDX: 0,
            ballDY: 0,
            ballPos: this.ballPos,
            scoreBoard: this.gameState.score
        };
        this.updateGameState = () => {
            this.gatewayOut.updateGameState(this.gameState);
        };
        this.updateBall = () => {
            var _a, _b;
            if (this.ballState) {
                this.ballState = this.gameLogicService.ballMove(this.ballState.ballDirection, this.ballState.ballPos, this.gameState.p1pos, this.gameState.p2pos, this.ballState.ballDX, this.ballState.ballDY, this.gameState.score);
            }
            if ((_a = this.ballState) === null || _a === void 0 ? void 0 : _a.scoreBoard)
                this.gameState.score = (_b = this.ballState) === null || _b === void 0 ? void 0 : _b.scoreBoard;
            if (this.ballState)
                this.gameState.ballPos = this.ballState.ballPos;
            return this.gatewayOut.sendBallPos(this.gameState.ballPos);
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
        }
    }
    updateP1Pos(direction) {
        if (direction === 'up') {
            if (this.gameState.p1pos.y > 0) {
                this.gameState.p1pos.y -= 6;
            }
        }
        else if (direction === 'down') {
            if (this.gameState.p1pos.y < KONVA_HEIGHT - 150) {
                this.gameState.p1pos.y += 6;
            }
        }
    }
    updateP2Pos(direction) {
        if (direction === 'up') {
            if (this.gameState.p2pos.y > 0) {
                this.gameState.p2pos.y -= 6;
            }
        }
        else if (direction === 'down') {
            if (this.gameState.p2pos.y < KONVA_HEIGHT - 150) {
                this.gameState.p2pos.y += 6;
            }
        }
    }
};
exports.GameLoopService = GameLoopService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [gameLogic_service_1.GameLogicService,
        gatewayOut_1.GatewayOut])
], GameLoopService);
