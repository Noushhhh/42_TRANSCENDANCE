"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameState = void 0;
const common_1 = require("@nestjs/common");
const KONVA_WIDTH = 1200;
const KONVA_HEIGHT = 800;
const PADDLE_WIDTH = 25;
// const PADDLE_HEIGHT = 10;
// const ballSpeed = 2;
const RAY_LENGHT = 15 + 20;
let GameState = class GameState {
    constructor() {
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
            ballState: {
                ballDirection: 'left',
                ballDX: 0,
                ballDY: 0,
                ballPos: {
                    x: KONVA_WIDTH / 2,
                    y: KONVA_HEIGHT / 2,
                },
            },
            ballRay: {
                x1: KONVA_WIDTH / 2,
                y1: KONVA_HEIGHT / 2,
                x2: KONVA_WIDTH / 2 + RAY_LENGHT * Math.cos((0 * Math.PI) / 180),
                y2: KONVA_HEIGHT / 2 + RAY_LENGHT * Math.sin((0 * Math.PI) / 180),
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
            scoreBoard: this.gameState.score
        };
    }
};
exports.GameState = GameState;
exports.GameState = GameState = __decorate([
    (0, common_1.Injectable)()
], GameState);
