import { Injectable } from '@nestjs/common';
import { gameConfig } from './data';
import { paddleGap } from './gameState';

const ballSpeed = 11 / 1200.0;

interface Vector2d {
  x: number;
  y: number;
}

// Have to implement a calculator between ball and paddle like a ray

@Injectable()
export class GameLogicService {
  // printGameConfig = () => {
  //   console.log("GameConfig in gameLoop: ", gameConfig.konvaHeight, gameConfig.konvaWidth);
  // }

  ballMove = (
    ballDirection: string,
    ballPos: Vector2d,
    p1Pos: Vector2d,
    p2Pos: Vector2d,
    ballDX: number,
    ballDY: number,
    scoreBoard: { p1Score: number, p2Score: number },
    ballRay: { x1: number, y1: number, x2: number, y2: number },
  ) => {
    const normBallX = ballPos.x;
    const normBallY = ballPos.y;
    const normP1Y = p1Pos.y;
    const normP2Y = p2Pos.y;
    const normP1X = p1Pos.x;
    const normP2X = p2Pos.x;

    const normPaddleWidth = gameConfig.paddleWidth;
    const normPaddleHeight = gameConfig.paddleHeight;

    const ballRadius = 25 / 1200.0;

    if (ballDirection === 'left') {
      // Touch left paddle condition
      if (
        normBallX > paddleGap + normPaddleWidth &&
        normBallX < paddleGap + normPaddleWidth + ballRadius &&
        normBallY > normP1Y - ballRadius &&
        normBallY < normP1Y + ballRadius + normPaddleHeight
      ) {
        const touch = normP1Y + normPaddleHeight / 2 - normBallY;
        const normalizedTouch = touch / (normPaddleHeight / 2);
        const velocity = normalizedTouch * (Math.PI / 2);
        ballDX = Math.cos(velocity) * ballSpeed;
        ballDY = -Math.sin(velocity) * ballSpeed;

        ballDirection = 'right';
        return { ballDirection, ballDX, ballDY, ballPos, scoreBoard };
      }
      // Touch top condition
      else if (normBallY < (0 + paddleGap)) {
        ballDY = -ballDY;
        // Touch bot condition
      } else if (normBallY > (1 - paddleGap)) {
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
      } else {
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
    } else if (ballDirection === 'right') {
      // Touch right paddle condition
      if (
        // @todo have to create a variable for the 30
        normBallX > (1 - gameConfig.paddleWidth - ballRadius) &&
        normBallX < (1 - gameConfig.paddleWidth - paddleGap) &&
        normBallY >= normP2Y - ballRadius &&
        normBallY <= normP2Y + ballRadius + normPaddleHeight
      ) {
        const touch = p2Pos.y + gameConfig.paddleHeight / 2 - ballPos.y;
        const normalizedTouch = touch / gameConfig.paddleHeight;
        const velocity = -(normalizedTouch * (Math.PI / 2));
        ballDX = Math.cos(velocity) * ballSpeed;
        ballDY = -Math.sin(velocity) * ballSpeed;

        ballDirection = 'left';
        return { ballDirection, ballDX, ballDY, ballPos, scoreBoard };
      }
      // Touch top condition
      else if (normBallY < (0 + paddleGap)) {
        ballDY = -ballDY;
        // Touch bot condition
      } else if (normBallY > (1 - paddleGap)) {
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
      } else {
        ballPos.x = ballPos.x + ballSpeed + Math.abs(ballDX);
        ballPos.y = ballPos.y + ballDY;
        return { ballDirection, ballDX, ballDY, ballPos, scoreBoard };
      }
    }
  };
}
