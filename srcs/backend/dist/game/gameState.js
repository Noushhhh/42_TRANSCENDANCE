"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameState = exports.paddleGap = void 0;
const common_1 = require("@nestjs/common");
const data_1 = require("./data");
const RAY_LENGHT = (15 + 20) / 1200;
const BALL_SIZE = 20 / 1200.0;
exports.paddleGap = 0.1 / 10;
let GameState = class GameState {
    constructor() {
        this.ballPos = {
            x: 0.5,
            y: 0.5,
        };
        this.gameData = {
            paddleHeight: data_1.gameConfig.paddleHeight,
            paddleWidth: data_1.gameConfig.paddleWidth,
        };
        this.playerSize = {
            p1Size: 150 / 1200.0,
            p2Size: 150 / 1200.0,
        };
        this.setP1Size = (num) => {
            this.playerSize.p1Size = this.playerSize.p1Size * num;
        };
        this.setP2Size = (num) => {
            this.playerSize.p2Size = this.playerSize.p2Size * num;
        };
        this.gameState = {
            p1Size: this.playerSize.p1Size,
            p2Size: this.playerSize.p2Size,
            p1pos: {
                x: exports.paddleGap,
                y: (0.5) - this.playerSize.p1Size / 2,
            },
            p2pos: {
                x: 1 - exports.paddleGap - data_1.gameConfig.paddleWidth,
                y: (0.5) - this.playerSize.p2Size / 2,
            },
            ballState: {
                ballDirection: 'right',
                ballDX: 0,
                ballDY: 0,
                ballPos: {
                    x: 0.5 - BALL_SIZE / 2,
                    y: 0.5 - BALL_SIZE / 2,
                },
                ballSpeed: 12.5 / 1200.0,
            },
            spawnPowerUp: 0,
            powerUpValueSet: false,
            powerUp: {
                x: -1,
                y: -1,
            },
            isPaused: true,
            score: {
                p1Score: 0,
                p2Score: 0,
            },
            isLobbyFull: false,
        };
        this.ballState = {
            ballDirection: 'left',
            ballDX: 0,
            ballDY: 0,
            ballPos: this.ballPos,
            scoreBoard: this.gameState.score,
            ballSpeed: 12.5 / 1200.0,
        };
    }
    printGameState() {
        console.log(this.gameState);
    }
};
exports.GameState = GameState;
exports.GameState = GameState = __decorate([
    (0, common_1.Injectable)()
], GameState);
