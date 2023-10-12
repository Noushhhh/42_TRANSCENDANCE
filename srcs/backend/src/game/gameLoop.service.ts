import { Injectable, OnApplicationBootstrap, OnModuleInit } from '@nestjs/common';
import { GameLogicService } from './gameLogic.service';
import { GatewayOut } from './gatewayOut';
import { lobbies } from './lobbies';
import { Socket } from 'socket.io';
import { gameConfig } from './data';
import { GameState } from './gameState';
import { paddleGap } from './gameState';
import { playerStatistics } from './playerStatistics.service';

const RAY_LENGHT = 35 / 1200;
const BALL_SIZE = 20 / 1200.0;
const SCORE_TO_WIN = 3;

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
    private readonly playerStats: playerStatistics,
  ) {
    this.gameLoopRunning = false;
  }

  resizeEvent() {
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

  // private updateSpawnPowerUp() {
  //   for (const [key, lobby] of lobbies) {
  //     const gameState = lobby.gameState.gameState;
  //     if (lobby.gameState.gameState.isPaused === true) continue;
  //     if (!lobby.gameState.gameState.powerUpValueSet) {
  //       lobby.gameState.gameState.powerUpValueSet = true;
  //       lobby.gameState.gameState.powerUp.x = this.gameLogicService.getRandomFloat(0.2, 0.8, 3);
  //     }
  //     lobby.gameState.gameState.spawnPowerUp += 1;
  //     if (lobby.gameState.gameState.spawnPowerUp > 50) {
  //       lobby.gameState.gameState.powerUp.y += 0.0025;
  //       if (lobby.gameState.gameState.powerUp.y > 1
  //         || this.gameLogicService.hasBallTouchedPowerUp(
  //           gameState.ballState.ballDirection,
  //           gameState.ballState.ballPos.x,
  //           gameState.ballState.ballPos.y,
  //           gameState.powerUp.x,
  //           gameState.powerUp.y,
  //         ) !== 0) {
  //         lobby.gameState.gameState.powerUp.y = -1;
  //         lobby.gameState.gameState.powerUpValueSet = false;
  //         console.log("je suis ici meme");
  //       }
  //     }
  //   }
  // }

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

  private hasBallTouchedPowerUp = () => {
    for (const [key, lobby] of lobbies) {
      if (lobby.gameState.gameState.isPaused === true) continue;

      if (this.gameLogicService.hasBallTouchedPowerUp(
        lobby.gameState.gameState.ballState.ballDirection,
        lobby.gameState.gameState.ballState.ballPos.x,
        lobby.gameState.gameState.ballState.ballPos.y,
        lobby.gameState.gameState.powerUp.x,
        lobby.gameState.gameState.powerUp.y,
      ) !== 0) {
      }
    }
  }

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
        lobby.gameState.gameState.ballState.ballSpeed,
        lobby.gameState.gameState.p1Size,
        lobby.gameState.gameState.p2Size,
      )
      if (ballState) {
        lobby.gameState.gameState.ballState = ballState;
      }
      const score = ballState?.scoreBoard;
      if (score) {
        lobby.gameState.gameState.score = score;
        if (score.p1Score === SCORE_TO_WIN || score.p2Score === SCORE_TO_WIN) {
          const winnerId = score.p1Score === SCORE_TO_WIN ? lobby.gameState.gameState.p1Id : lobby.gameState.gameState.p2Id;
          this.playerStats.addWinToPlayer(winnerId);
          console.log(score.p1Score === SCORE_TO_WIN ? "P1WIN" : "P2WIN");
          lobby.gameState.gameState.score = { p1Score: 0, p2Score: 0 };
          lobby.gameState.gameState.p1pos = {
            x: paddleGap,
            y: (0.5) - lobby.gameState.gameState.p1Size / 2,
          }
          lobby.gameState.gameState.p2pos = {
            x: 1 - paddleGap - gameConfig.paddleWidth,
            y: (0.5) - lobby.gameState.gameState.p2Size / 2,
          }
          lobby.gameState.gameState.ballState.ballDY = 0;
          lobby.gameState.gameState.isPaused = true;
          this.gatewayOut.emitToRoom(key, 'newGame', true);
        }
      }
    }
  };
}
