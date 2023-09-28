import { Injectable, OnModuleInit } from '@nestjs/common';
import { GameLogicService } from './gameLogic.service';
import { GatewayOut } from './gatewayOut';
import { lobbies } from './lobbies';
import { Socket } from 'socket.io';
import { gameConfig } from './data';
import { GameState } from './gameState';

const RAY_LENGHT = 35 / 1200;
const BALL_SIZE = 20 / 1200.0;

interface Vector2d {
  x: number;
  y: number;
}

interface GameData {
  konvaHeight: number;
  konvaWidth: number;
  paddleHeight: number;
  paddleWidth: number;
}

const moveSpeed = 6 / 800.0;

@Injectable()
export class GameLoopService implements OnModuleInit {
  private gameLoopRunning: boolean;

  constructor(
    private readonly gameLogicService: GameLogicService,
    private readonly gatewayOut: GatewayOut,
  ) {
    this.gameLoopRunning = false;
  }

  onModuleInit() {
    this.updateBall();
    this.updateGameState();
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
    this.gatewayOut.updateLobbiesGameState();
  };

  private findPlayerLobby(player: Socket): string {
    for (const [key, value] of lobbies) {
      if (player.id === value.player1?.id || player.id === value.player2?.id)
        return key;
    }
    return '-1';
  }

  updatePlayerPos(direction: string, player: Socket) {
    const lobbyId = this.findPlayerLobby(player);
    const lobby = lobbies.get(lobbyId);
    if (lobby?.gameState.gameState.isPaused === true) return;
    if (!lobby)
      return;
    if (player.id === lobby.player1?.id) {
      if (direction === 'up') {
        if (lobby.gameState.gameState.p1pos.y > 0) {
          lobby.gameState.gameState.p1pos.y -= moveSpeed;
        }
      } else if (direction === 'down') {
        if (lobby.gameState.gameState.p1pos.y < 1 - gameConfig.paddleHeight) {
          lobby.gameState.gameState.p1pos.y += moveSpeed;
        }
      }
    } else {
      if (direction === 'up') {
        if (lobby.gameState.gameState.p2pos.y > 0) {
          lobby.gameState.gameState.p2pos.y -= moveSpeed;
        }
      } else if (direction === 'down') {
        if (lobby.gameState.gameState.p2pos.y < 1 - gameConfig.paddleHeight) {
          lobby.gameState.gameState.p2pos.y += moveSpeed;
        }
      }
    }
  }

  // printGameData() {
  //   // console.log("print 3: ", gameConfig.konvaHeight, gameConfig.konvaWidth);
  // }

  // private updateRayUp = (gameState: GameState) => {
  //   if (gameState.gameState.ballState.ballDirection === 'right') {
  //     gameState.gameState.ballRayUp.x1 = gameState.gameState.ballState.ballPos.x + BALL_SIZE;
  //     gameState.gameState.ballRayUp.y1 = gameState.gameState.ballState.ballPos.y;
  //     gameState.gameState.ballRayUp.x2 = gameState.gameState.ballState.ballPos.x + RAY_LENGHT * Math.cos((0 * Math.PI) / 180);
  //     gameState.gameState.ballRayUp.y2 = gameState.gameState.ballState.ballPos.y + RAY_LENGHT * Math.sin((0 * Math.PI) / 180);
  //     return gameState.gameState.ballRayUp;
  //   } else {
  //     gameState.gameState.ballRayUp.x1 = gameState.gameState.ballState.ballPos.x;
  //     gameState.gameState.ballRayUp.y1 = gameState.gameState.ballState.ballPos.y;
  //     gameState.gameState.ballRayUp.x2 = gameState.gameState.ballState.ballPos.x - RAY_LENGHT * Math.cos((0 * Math.PI) / 180);
  //     gameState.gameState.ballRayUp.y2 = gameState.gameState.ballState.ballPos.y - RAY_LENGHT * Math.sin((0 * Math.PI) / 180);
  //     return gameState.gameState.ballRayUp;
  //   }
  // }

  // private updateRayDown = (gameState: GameState) => {
  //   if (gameState.gameState.ballState.ballDirection === 'right') {
  //     gameState.gameState.ballRayDown.x1 = gameState.gameState.ballState.ballPos.x + BALL_SIZE;
  //     gameState.gameState.ballRayDown.y1 = gameState.gameState.ballState.ballPos.y + BALL_SIZE;
  //     gameState.gameState.ballRayDown.x2 = gameState.gameState.ballState.ballPos.x + RAY_LENGHT * Math.cos((0 * Math.PI) / 180);
  //     gameState.gameState.ballRayDown.y2 = gameState.gameState.ballState.ballPos.y + RAY_LENGHT * Math.sin((0 * Math.PI) / 180) + BALL_SIZE;
  //     return gameState.gameState.ballRayDown;
  //   } else {
  //     gameState.gameState.ballRayDown.x1 = gameState.gameState.ballState.ballPos.x;
  //     gameState.gameState.ballRayDown.y1 = gameState.gameState.ballState.ballPos.y + BALL_SIZE;
  //     gameState.gameState.ballRayDown.x2 = gameState.gameState.ballState.ballPos.x - RAY_LENGHT * Math.cos((0 * Math.PI) / 180);
  //     gameState.gameState.ballRayDown.y2 = gameState.gameState.ballState.ballPos.y - RAY_LENGHT * Math.sin((0 * Math.PI) / 180) + BALL_SIZE;
  //     return gameState.gameState.ballRayDown;
  //   }
  // }

  private updateBall = () => {
    for (const [key, lobby] of lobbies) {
      if (lobby.gameState.gameState.isPaused === true) continue;
      const ballState = this.gameLogicService.ballMove(
        lobby.gameState.gameState.ballState.ballDirection,
        lobby.gameState.gameState.ballState.ballPos,
        lobby.gameState.gameState.p1pos,
        lobby.gameState.gameState.p2pos,
        lobby.gameState.gameState.ballState.ballDX,
        lobby.gameState.gameState.ballState.ballDY,
        lobby.gameState.gameState.score,
        lobby.gameState.gameState.ballRayUp,
        lobby.gameState.gameState.ballState.ballSpeed
      )
      if (ballState) {
        lobby.gameState.gameState.ballState = ballState;
      }
      const score = ballState?.scoreBoard;
      if (score) lobby.gameState.gameState.score = score;

    }
  };
}
