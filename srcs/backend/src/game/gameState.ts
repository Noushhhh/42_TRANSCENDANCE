import { Injectable } from "@nestjs/common";
import { gameConfig } from './data';

const RAY_LENGHT = (15 + 20) / 1200;
const BALL_SIZE = 20 / 1200.0;

interface GameData {
  paddleHeight: number;
  paddleWidth: number;
}

interface Vector2d {
  x: number;
  y: number;
}

export const paddleGap = 0.1/10;

@Injectable()
export class GameState {
  private ballPos: Vector2d = {
    x: 0.5,
    y: 0.5,
  }

  public gameData: GameData = {
    paddleHeight: gameConfig.paddleHeight,
    paddleWidth: gameConfig.paddleWidth,
  }

  public printGameState() {
    console.log(this.gameState);
  }

  gameState = {
    p1pos: {
      x: paddleGap,
      y: (0.5) - gameConfig.paddleHeight / 2,
    },
    p2pos: {
      x: 1 - paddleGap - gameConfig.paddleWidth,
      y: (0.5) - gameConfig.paddleHeight / 2,
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
    ballRayUp: {
      x1: 0.5,
      y1: 0.5,
      x2: 0.5 + RAY_LENGHT * Math.cos((0 * Math.PI) / 180),
      y2: 0.5 + RAY_LENGHT * Math.sin((0 * Math.PI) / 180),
    },
    ballRayDown: {
      x1: 0.5,
      y1: 0.5,
      x2: 0.5 + RAY_LENGHT * Math.cos((0 * Math.PI) / 180),
      y2: 0.5 + RAY_LENGHT * Math.sin((0 * Math.PI) / 180),
    },
    isPaused: true,
    score: {
      p1Score: 0,
      p2Score: 0,
    },
    isLobbyFull: false,
  };

  ballState = {
    ballDirection: 'left',
    ballDX: 0,
    ballDY: 0,
    ballPos: this.ballPos,
    scoreBoard: this.gameState.score,
    ballSpeed: 12.5 / 1200.0,
  };
}
