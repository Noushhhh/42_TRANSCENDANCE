import { Injectable } from '@nestjs/common';

const KONVA_WIDTH = 1200;
const KONVA_HEIGHT = 800;
const PADDLE_WIDTH = 25;
const PADDLE_HEIGHT = 150;
const ballSpeed = 11;

interface Vector2d {
  x: number;
  y: number;
}

// Have to implement a calculator between ball and paddle like a ray

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
  ) => {
    if (ballDirection === 'left') {
      // Touch left paddle condition
      if (
        ballPos.x > 10 + PADDLE_WIDTH &&
        ballPos.x < 10 + PADDLE_WIDTH + 25 &&
        ballPos.y > p1Pos.y &&
        ballPos.y < p1Pos.y + PADDLE_HEIGHT
      ) {
        const touch = p1Pos.y + PADDLE_HEIGHT / 2 - ballPos.y;
        const normalizedTouch = touch / (PADDLE_HEIGHT / 2);
        const velocity = normalizedTouch * (Math.PI / 1);
        ballDX = Math.cos(velocity) * 4;
        ballDY = -Math.sin(velocity) * 4;

        ballDirection = 'right';
        return { ballDirection, ballDX, ballDY, ballPos, scoreBoard };
      }
      // Touch top condition
      else if (ballPos.y < 0 + 10) {
        ballDY = -ballDY;
        // Touch bot condition
      } else if (ballPos.y > KONVA_HEIGHT - 10) {
        ballDY = -ballDY;
      }
      // If the ball go after the left paddle
      if (ballPos.x < 0) {
        // left paddle scored
        ballPos.x = KONVA_WIDTH / 2;
        ballPos.y = KONVA_HEIGHT / 2;
        ballDX = 0;
        ballDY = 0;
        scoreBoard.p1Score += 1;
        return { ballDirection, ballDX, ballDY, ballPos, scoreBoard };
        // Normal move to left condition
      } else {
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
    } else if (ballDirection === 'right') {
      // Touch left paddle condition
      if (
        ballPos.x > KONVA_WIDTH - PADDLE_WIDTH - 30 &&
        ballPos.x < KONVA_WIDTH - PADDLE_WIDTH - 10 &&
        ballPos.y > p2Pos.y &&
        ballPos.y < p2Pos.y + PADDLE_HEIGHT
      ) {
        const touch = p2Pos.y + PADDLE_HEIGHT / 2 - ballPos.y;
        const normalizedTouch = touch / (PADDLE_HEIGHT / 2);
        const velocity = -(normalizedTouch * (Math.PI / 1));
        ballDX = Math.cos(velocity) * 4;
        ballDY = -Math.sin(velocity) * 4;

        ballDirection = 'left';
        return { ballDirection, ballDX, ballDY, ballPos, scoreBoard };
      }
      // Touch top condition
      else if (ballPos.y < 0 + 10) {
        ballDY = -ballDY;
        // Touch bot condition
      } else if (ballPos.y > KONVA_HEIGHT - 10) {
        ballDY = -ballDY;
      }
      // If the ball go after the left paddle
      if (ballPos.x > KONVA_WIDTH) {
        // right paddle scored
        ballPos.x = KONVA_WIDTH / 2;
        ballPos.y = KONVA_HEIGHT / 2;
        ballDX = 0;
        ballDY = 0;
        scoreBoard.p2Score += 1;
        return { ballDirection, ballDX, ballDY, ballPos, scoreBoard };
        // Normal move to left condition
      } else {
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
