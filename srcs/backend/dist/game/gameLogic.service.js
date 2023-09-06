"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameLogicService = void 0;
const common_1 = require("@nestjs/common");
const KONVA_WIDTH = 1200;
const KONVA_HEIGHT = 800;
const PADDLE_WIDTH = 25;
const PADDLE_HEIGHT = 150;
const ballSpeed = 11;
let GameLogicService = class GameLogicService {
    constructor() {
        this.ballMove = (ballDirection, ballPos, p1Pos, p2Pos, ballDX, ballDY, scoreBoard, ballRay) => {
            if (ballDirection === 'left') {
                if (ballPos.x > 10 + PADDLE_WIDTH &&
                    ballPos.x < 10 + PADDLE_WIDTH + 25 &&
                    ballPos.y > p1Pos.y &&
                    ballPos.y < p1Pos.y + PADDLE_HEIGHT) {
                    const touch = p1Pos.y + PADDLE_HEIGHT / 2 - ballPos.y;
                    const normalizedTouch = touch / (PADDLE_HEIGHT / 2);
                    const velocity = normalizedTouch * (Math.PI / 1);
                    ballDX = Math.cos(velocity) * 4;
                    ballDY = -Math.sin(velocity) * 4;
                    ballDirection = 'right';
                    return { ballDirection, ballDX, ballDY, ballPos, scoreBoard };
                }
                else if (ballPos.y < 0 + 10) {
                    ballDY = -ballDY;
                }
                else if (ballPos.y > KONVA_HEIGHT - 10) {
                    ballDY = -ballDY;
                }
                if (ballPos.x < 0) {
                    ballPos.x = KONVA_WIDTH / 2;
                    ballPos.y = KONVA_HEIGHT / 2;
                    ballDX = 0;
                    ballDY = 0;
                    scoreBoard.p1Score += 1;
                    return { ballDirection, ballDX, ballDY, ballPos, scoreBoard };
                }
                else {
                    const velocityMagnitude = Math.sqrt(ballDX * ballDX + ballDY * ballDY);
                    if (velocityMagnitude > 2) {
                        const scalingFactor = 2 / velocityMagnitude;
                        ballDX *= scalingFactor;
                        ballDY *= scalingFactor;
                    }
                    ballPos.x = ballPos.x - ballSpeed - Math.abs(ballDX);
                    ballPos.y = ballPos.y - ballDY;
                    return { ballDirection, ballDX, ballDY, ballPos, scoreBoard };
                }
            }
            else if (ballDirection === 'right') {
                if (ballPos.x > KONVA_WIDTH - PADDLE_WIDTH - 30 &&
                    ballPos.x < KONVA_WIDTH - PADDLE_WIDTH - 10 &&
                    ballPos.y > p2Pos.y &&
                    ballPos.y < p2Pos.y + PADDLE_HEIGHT) {
                    const touch = p2Pos.y + PADDLE_HEIGHT / 2 - ballPos.y;
                    const normalizedTouch = touch / (PADDLE_HEIGHT / 2);
                    const velocity = -(normalizedTouch * (Math.PI / 1));
                    ballDX = Math.cos(velocity) * 4;
                    ballDY = -Math.sin(velocity) * 4;
                    ballDirection = 'left';
                    return { ballDirection, ballDX, ballDY, ballPos, scoreBoard };
                }
                else if (ballPos.y < 0 + 10) {
                    ballDY = -ballDY;
                }
                else if (ballPos.y > KONVA_HEIGHT - 10) {
                    ballDY = -ballDY;
                }
                if (ballPos.x > KONVA_WIDTH) {
                    ballPos.x = KONVA_WIDTH / 2;
                    ballPos.y = KONVA_HEIGHT / 2;
                    ballDX = 0;
                    ballDY = 0;
                    scoreBoard.p2Score += 1;
                    return { ballDirection, ballDX, ballDY, ballPos, scoreBoard };
                }
                else {
                    const velocityMagnitude = Math.sqrt(ballDX * ballDX + ballDY * ballDY);
                    if (velocityMagnitude > 2) {
                        const scalingFactor = 2 / velocityMagnitude;
                        ballDX *= scalingFactor;
                        ballDY *= scalingFactor;
                    }
                    ballPos.x = ballPos.x + ballSpeed + Math.abs(ballDX);
                    ballPos.y = ballPos.y + ballDY;
                    return { ballDirection, ballDX, ballDY, ballPos, scoreBoard };
                }
            }
        };
    }
};
exports.GameLogicService = GameLogicService;
exports.GameLogicService = GameLogicService = __decorate([
    (0, common_1.Injectable)()
], GameLogicService);
//# sourceMappingURL=gameLogic.service.js.map