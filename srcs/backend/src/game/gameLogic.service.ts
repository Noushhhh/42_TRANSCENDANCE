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
  ballState = {
    ballDirection: 'left',
    ballDX: 0,
    ballDY: 0,
    ballPos: {
      x: KONVA_WIDTH / 2,
      y: KONVA_HEIGHT / 2,
    },
  };

  gameState = {
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

  ballMove = (
    ballDirection: string,
    ballPos: Vector2d,
    p1Pos: Vector2d,
    p2Pos: Vector2d,
    ballDX: number,
    ballDY: number,
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
        return { ballDirection, ballDX, ballDY, ballPos };
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
        // right paddle scored
        ballPos.x = KONVA_WIDTH / 2;
        ballPos.y = KONVA_HEIGHT / 2;
        ballDX = 0;
        ballDY = 0;
        return { ballDirection, ballDX, ballDY, ballPos };
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
        return { ballDirection, ballDX, ballDY, ballPos };
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
        return { ballDirection, ballDX, ballDY, ballPos };
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
        return { ballDirection, ballDX, ballDY, ballPos };
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
        return { ballDirection, ballDX, ballDY, ballPos };
      }
    }
  };
}
