import { Injectable } from '@nestjs/common';
import { GameLogicService } from './gameLogic.service';
import { GatewayOut } from './gatewayOut';

const KONVA_WIDTH = 1200;
const KONVA_HEIGHT = 800;
const PADDLE_WIDTH = 25;
// const PADDLE_HEIGHT = 10;
// const ballSpeed = 2;

interface Vector2d {
  x: number;
  y: number;
}

@Injectable()
export class GameLoopService {
  private gameLoopRunning: boolean;

  private ballPos: Vector2d = {
    x: KONVA_WIDTH / 2,
    y: KONVA_HEIGHT / 2,
  }

  
  private gameState = {
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

  private ballState?= {
    ballDirection: 'left',
    ballDX: 0,
    ballDY: 0,
    ballPos: this.ballPos,
    scoreBoard: this.gameState.score
  };

  constructor(
    private readonly gameLogicService: GameLogicService,
    private readonly gatewayOut: GatewayOut,
  ) {
    this.gameLoopRunning = false;
  }

  startGameLoop() {
    if (this.gameLoopRunning) {
      return;
    }

    this.gameLoopRunning = true;
    this.gameLoop();
  }

  stopGameLoop() {
    this.gameLoopRunning = false;
    return;
  }

  private gameLoop() {
    this.updateBall();
    this.updateGameState();

    if (this.gameLoopRunning) {
      setTimeout(() => {
        this.gameLoop();
      }, 1000 / 60);
    }
  }

  private updateGameState = () => {
    this.gatewayOut.updateGameState(this.gameState);
  };

  updateP1Pos(direction: string) {
    if (direction === 'up') {
      if (this.gameState.p1pos.y > 0) {
        this.gameState.p1pos.y -= 6;
      }
    } else if (direction === 'down') {
      if (this.gameState.p1pos.y < KONVA_HEIGHT - 150) {
        this.gameState.p1pos.y += 6;
      }
    }
  }

  updateP2Pos(direction: string) {
    if (direction === 'up') {
      if (this.gameState.p2pos.y > 0) {
        this.gameState.p2pos.y -= 6;
      }
    } else if (direction === 'down') {
      if (this.gameState.p2pos.y < KONVA_HEIGHT - 150) {
        this.gameState.p2pos.y += 6;
      }
    }
  }

  private updateBall = () => {
    if (this.ballState) {
      this.ballState = this.gameLogicService.ballMove(
        this.ballState.ballDirection,
        this.ballState.ballPos,
        this.gameState.p1pos,
        this.gameState.p2pos,
        this.ballState.ballDX,
        this.ballState.ballDY,
        this.gameState.score,
      );
    }
    if (this.ballState?.scoreBoard) this.gameState.score = this.ballState?.scoreBoard;
    if (this.ballState) this.gameState.ballPos = this.ballState.ballPos;
    return this.gatewayOut.sendBallPos(this.gameState.ballPos);
  };
}
