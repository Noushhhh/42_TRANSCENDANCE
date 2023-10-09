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
const data_1 = require("./data");
const gameState_1 = require("./gameState");
// const ballSpeed = 10 / 1200.0;
const ballSize = 20 / 1200.0;
const powerUpSize = 180 / 1200;
let GameLogicService = class GameLogicService {
    constructor() {
        this.ballMove = (ballDirection, ballPos, p1Pos, p2Pos, ballDX, ballDY, scoreBoard, ballSpeed, paddleWidth, paddleHeight) => {
            const normBallX = ballPos.x;
            const normBallY = ballPos.y;
            const normP1Y = p1Pos.y;
            const normP2Y = p2Pos.y;
            const normP1X = p1Pos.x;
            const normP2X = p2Pos.x;
            const normPaddleWidth = data_1.gameConfig.paddleWidth;
            const normPaddleHeight = data_1.gameConfig.paddleHeight;
            const ballRadius = 20 / 1200.0;
            if (ballDirection === 'left') {
                // Touch left paddle condition
                if ((normBallX > gameState_1.paddleGap && // ball a droite de la gauche de P1
                    normBallX < gameState_1.paddleGap + normPaddleWidth + 0.01 && // ball a gauche de la droite de P1
                    normBallY + ballSize > normP1Y && // bas de la ball en dessous du haut de P1
                    normBallY < normP1Y + normPaddleHeight) // haut de la ball au dessus du bas de P1
                ) {
                    const hitHeightPaddle = 25 * ((normBallY + ballSize / 2) - (normP1Y + normPaddleHeight / 2));
                    ballDX = -ballDX;
                    ballDY = hitHeightPaddle * ballSpeed;
                    ballDirection = 'right';
                    return { ballDirection, ballDX, ballDY, ballPos, scoreBoard, ballSpeed };
                }
                // Touch top condition
                else if (normBallY < (0)) {
                    ballDY = -ballDY;
                    // Touch bot condition
                }
                else if (normBallY > (1 - ballSize)) {
                    ballDY = -ballDY;
                }
                // If the ball go after the left paddle
                if (ballPos.x < 0) {
                    // left paddle scored
                    ballPos.x = 0.5 - ballSize / 2;
                    ballPos.y = 0.5 - ballSize / 2;
                    ballDX = 0;
                    ballDY = 0 + this.getRandomFloat(-0.013, 0.013, 6);
                    scoreBoard.p2Score += 1;
                    return { ballDirection: "right", ballDX, ballDY, ballPos, scoreBoard, ballSpeed };
                    // Normal move to left condition
                }
                else {
                    ballPos.x = ballPos.x - ballSpeed - Math.abs(ballDX);
                    ballPos.y = ballPos.y - ballDY;
                    return { ballDirection, ballDX, ballDY, ballPos, scoreBoard, ballSpeed };
                }
            }
            else if (ballDirection === 'right') {
                if ((normBallX + ballSize < 1 - gameState_1.paddleGap && // ball a droite de la gauche de P1
                    normBallX + ballSize > 1 - gameState_1.paddleGap - normPaddleWidth - 0.01 && // ball a gauche de la droite de P1
                    normBallY + ballSize > normP2Y && // bas de la ball en dessous du haut de P1
                    normBallY < normP2Y + normPaddleHeight) // haut de la ball au dessus du bas de P1
                ) {
                    const hitHeightPaddle = 25 * ((normBallY + ballSize / 2) - (normP2Y + normPaddleHeight / 2));
                    ballDX = -ballDX;
                    ballDY = -(hitHeightPaddle * ballSpeed);
                    ballDirection = 'left';
                    return { ballDirection, ballDX, ballDY, ballPos, scoreBoard, ballSpeed };
                }
                // Touch top condition
                else if (normBallY < 0) {
                    ballDY = -ballDY;
                    // Touch bot condition
                }
                else if (normBallY > (1 - ballSize)) {
                    ballDY = -ballDY;
                }
                // If the ball go after the left paddle
                if (ballPos.x > 1) {
                    // right paddle scored
                    ballPos.x = 0.5 - ballSize / 2;
                    ballPos.y = 0.5 - ballSize / 2;
                    ballDX = 0;
                    ballDY = 0 + this.getRandomFloat(-0.013, 0.013, 6);
                    scoreBoard.p1Score += 1;
                    return { ballDirection: "left", ballDX, ballDY, ballPos, scoreBoard, ballSpeed };
                    // Normal move to right condition
                }
                else {
                    ballPos.x = ballPos.x + ballSpeed + Math.abs(ballDX);
                    ballPos.y = ballPos.y + ballDY;
                    return { ballDirection, ballDX, ballDY, ballPos, scoreBoard, ballSpeed };
                }
            }
        };
        this.hasBallTouchedPowerUp = (ballDirection, ballX, ballY, PUX, PUY) => {
            if (ballDirection === "right") {
                if ((ballX + ballSize > PUX && ballX < PUX + powerUpSize
                    && ballY + ballSize >= PUY && ballY + ballSize < PUY + powerUpSize / 2)
                    || // Touch by bottom condition
                        (ballX + ballSize > PUX && ballX < PUX + powerUpSize
                            && ballY <= PUY + powerUpSize && ballY + ballSize / 2 > PUY + powerUpSize)) {
                    console.log("p1 touched the PU");
                    return (1);
                }
            }
            if (ballDirection === "left") {
                if (ballX + ballSize > PUX && ballX < PUX + powerUpSize
                    && ballY >= PUY && ballY < PUY + powerUpSize / 2) {
                    console.log("p2 touched the PU");
                    return (2);
                }
            }
            return 0;
        };
    }
    getRandomFloat(min, max, decimals) {
        const str = (Math.random() * (max - min) + min).toFixed(decimals);
        return parseFloat(str);
    }
};
exports.GameLogicService = GameLogicService;
exports.GameLogicService = GameLogicService = __decorate([
    (0, common_1.Injectable)()
], GameLogicService);
