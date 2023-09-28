import { Injectable } from '@nestjs/common';
import { gameConfig } from './data';
import { paddleGap } from './gameState';

// const ballSpeed = 10 / 1200.0;
const ballSize = 20 / 1200.0;

interface Vector2d {
  x: number;
  y: number;
}

@Injectable()
export class GameLogicService {
  ballMove = (
    ballDirection: string,
    ballPos: Vector2d,
    p1Pos: Vector2d,
    p2Pos: Vector2d,
    ballDX: number,
    ballDY: number,
    scoreBoard: { p1Score: number, p2Score: number },
    ballRay: { x1: number, y1: number, x2: number, y2: number },
    ballSpeed: number,
  ) => {
    const normBallX = ballPos.x;
    const normBallY = ballPos.y;
    const normP1Y = p1Pos.y;
    const normP2Y = p2Pos.y;
    const normP1X = p1Pos.x;
    const normP2X = p2Pos.x;

    const normPaddleWidth = gameConfig.paddleWidth;
    const normPaddleHeight = gameConfig.paddleHeight;

    const ballRadius = 20 / 1200.0;

    if (ballDirection === 'left') {
      // Touch left paddle condition
      if (
        (normBallX > paddleGap && // ball a droite de la gauche de P1
          normBallX < paddleGap + normPaddleWidth + 0.01 &&  // ball a gauche de la droite de P1
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
      } else if (normBallY > (1 - ballSize)) {
        ballDY = -ballDY;
      }
      // If the ball go after the left paddle
      if (ballPos.x < 0) {
        // left paddle scored
        ballPos.x = 0.5 - ballSize / 2;
        ballPos.y = 0.5 - ballSize / 2;
        ballDX = 0;
        ballDY = 0;
        scoreBoard.p2Score += 1;
        return { ballDirection: "right", ballDX, ballDY, ballPos, scoreBoard, ballSpeed };
        // Normal move to left condition
      } else {
        ballPos.x = ballPos.x - ballSpeed - Math.abs(ballDX);
        ballPos.y = ballPos.y - ballDY;
        return { ballDirection, ballDX, ballDY, ballPos, scoreBoard, ballSpeed };
      }
    } else if (ballDirection === 'right') {
      if (
        (normBallX + ballSize < 1 - paddleGap && // ball a droite de la gauche de P1
          normBallX + ballSize > 1 - paddleGap - normPaddleWidth - 0.01 &&  // ball a gauche de la droite de P1
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
      } else if (normBallY > (1 - ballSize)) {
        ballDY = -ballDY;
      }
      // If the ball go after the left paddle
      if (ballPos.x > 1) {
        // right paddle scored
        ballPos.x = 0.5 - ballSize / 2;
        ballPos.y = 0.5 - ballSize / 2;
        ballDX = 0;
        ballDY = 0;
        scoreBoard.p1Score += 1;
        return { ballDirection: "right", ballDX, ballDY, ballPos, scoreBoard, ballSpeed };
        // Normal move to right condition
      } else {
        ballPos.x = ballPos.x + ballSpeed + Math.abs(ballDX);
        ballPos.y = ballPos.y + ballDY;
        return { ballDirection, ballDX, ballDY, ballPos, scoreBoard, ballSpeed };
      }
    }
  };
}
