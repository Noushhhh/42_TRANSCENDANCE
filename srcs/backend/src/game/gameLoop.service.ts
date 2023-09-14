import { Injectable } from '@nestjs/common';
import { GameLogicService } from './gameLogic.service';
import { GatewayOut } from './gatewayOut';
import { lobbies } from './lobbies';
import { Socket } from 'socket.io';
import { gameConfig } from './data';
import { GameState } from './gameState';

const RAY_LENGHT = 15 + 20;

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
export class GameLoopService {
  private gameLoopRunning: boolean;

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
      // }, 1000 / 60);
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

  // private updateRay = () => {
  //   this.gameState.ballRay.x1 = this.gameState.ballState.ballPos.x;
  //   this.gameState.ballRay.y1 = this.gameState.ballState.ballPos.y;
  //   if (this.gameState.ballState.ballDirection === 'right') {
  //     this.gameState.ballRay.x2 = this.gameState.ballState.ballPos.x + RAY_LENGHT * Math.cos((0 * Math.PI) / 180);
  //     this.gameState.ballRay.y2 = this.gameState.ballState.ballPos.y + RAY_LENGHT * Math.sin((0 * Math.PI) / 180);
  //     return;
  //   }
  //   this.gameState.ballRay.x2 = this.gameState.ballState.ballPos.x - RAY_LENGHT * Math.cos((0 * Math.PI) / 180);
  //   this.gameState.ballRay.y2 = this.gameState.ballState.ballPos.y - RAY_LENGHT * Math.sin((0 * Math.PI) / 180);

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
        lobby.gameState.gameState.ballRay,
      )
      if (ballState) {
        lobby.gameState.gameState.ballState = ballState;
      }
      const score = ballState?.scoreBoard;
      if (score) lobby.gameState.gameState.score = score;
    }
  };
}
