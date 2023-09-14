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
const ballSpeed = 11 / 1200.0;
// Have to implement a calculator between ball and paddle like a ray
let GameLogicService = class GameLogicService {
    constructor() {
        // printGameConfig = () => {
        //   console.log("GameConfig in gameLoop: ", gameConfig.konvaHeight, gameConfig.konvaWidth);
        // }
        this.ballMove = (ballDirection, ballPos, p1Pos, p2Pos, ballDX, ballDY, scoreBoard, ballRay) => {
            const normBallX = ballPos.x;
            const normBallY = ballPos.y;
            const normP1Y = p1Pos.y;
            const normP2Y = p2Pos.y;
            const normP1X = p1Pos.x;
            const normP2X = p2Pos.x;
            const normPaddleWidth = data_1.gameConfig.paddleWidth;
            const normPaddleHeight = data_1.gameConfig.paddleHeight;
            const ballRadius = 25 / 1200.0;
            if (ballDirection === 'left') {
                // Touch left paddle condition
                if (normBallX > gameState_1.paddleGap + normPaddleWidth &&
                    normBallX < gameState_1.paddleGap + normPaddleWidth + ballRadius &&
                    normBallY > normP1Y - ballRadius &&
                    normBallY < normP1Y + ballRadius + normPaddleHeight) {
                    const touch = normP1Y + normPaddleHeight / 2 - normBallY;
                    const normalizedTouch = touch / (normPaddleHeight / 2);
                    const velocity = normalizedTouch * (Math.PI / 2);
                    ballDX = Math.cos(velocity) * ballSpeed;
                    ballDY = -Math.sin(velocity) * ballSpeed;
                    ballDirection = 'right';
                    return { ballDirection, ballDX, ballDY, ballPos, scoreBoard };
                }
                // Touch top condition
                else if (normBallY < (0 + gameState_1.paddleGap)) {
                    ballDY = -ballDY;
                    // Touch bot condition
                }
                else if (normBallY > (1 - gameState_1.paddleGap)) {
                    ballDY = -ballDY;
                }
                // If the ball go after the left paddle
                if (ballPos.x < 0) {
                    // left paddle scored
                    ballPos.x = 0.5;
                    ballPos.y = 0.5;
                    ballDX = 0;
                    ballDY = 0;
                    scoreBoard.p1Score += 1;
                    return { ballDirection: "right", ballDX, ballDY, ballPos, scoreBoard };
                    // Normal move to left condition
                }
                else {
                    // const velocityMagnitude = Math.sqrt(ballDX * ballDX + ballDY * ballDY);
                    // if (velocityMagnitude > 2) {
                    //   const scalingFactor = 2 / velocityMagnitude;
                    //   ballDX *= scalingFactor;
                    //   ballDY *= scalingFactor;
                    // }
                    ballPos.x = ballPos.x - ballSpeed - Math.abs(ballDX);
                    ballPos.y = ballPos.y - ballDY;
                    return { ballDirection, ballDX, ballDY, ballPos, scoreBoard };
                }
            }
            else if (ballDirection === 'right') {
                // Touch right paddle condition
                if (
                // @todo have to create a variable for the 30
                normBallX > (1 - data_1.gameConfig.paddleWidth - ballRadius) &&
                    normBallX < (1 - data_1.gameConfig.paddleWidth - gameState_1.paddleGap) &&
                    normBallY >= normP2Y - ballRadius &&
                    normBallY <= normP2Y + ballRadius + normPaddleHeight) {
                    const touch = p2Pos.y + data_1.gameConfig.paddleHeight / 2 - ballPos.y;
                    const normalizedTouch = touch / data_1.gameConfig.paddleHeight;
                    const velocity = -(normalizedTouch * (Math.PI / 2));
                    ballDX = Math.cos(velocity) * ballSpeed;
                    ballDY = -Math.sin(velocity) * ballSpeed;
                    ballDirection = 'left';
                    return { ballDirection, ballDX, ballDY, ballPos, scoreBoard };
                }
                // Touch top condition
                else if (normBallY < (0 + gameState_1.paddleGap)) {
                    ballDY = -ballDY;
                    // Touch bot condition
                }
                else if (normBallY > (1 - gameState_1.paddleGap)) {
                    ballDY = -ballDY;
                }
                // If the ball go after the left paddle
                if (ballPos.x > 1) {
                    // right paddle scored
                    ballPos.x = 0.5;
                    ballPos.y = 0.5;
                    ballDX = 0;
                    ballDY = 0;
                    scoreBoard.p2Score += 1;
                    return { ballDirection: "right", ballDX, ballDY, ballPos, scoreBoard };
                    // Normal move to right condition
                }
                else {
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
