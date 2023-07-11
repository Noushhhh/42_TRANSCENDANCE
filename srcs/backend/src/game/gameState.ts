import { Injectable } from "@nestjs/common";

const KONVA_WIDTH = 1200;
const KONVA_HEIGHT = 800;
const PADDLE_WIDTH = 25;
// const PADDLE_HEIGHT = 10;
// const ballSpeed = 2;
const RAY_LENGHT = 15 + 20;

@Injectable()
export class GameState {
  gameState = {
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
  };
}
