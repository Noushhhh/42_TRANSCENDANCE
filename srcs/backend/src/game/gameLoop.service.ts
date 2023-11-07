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

const moveSpeed = 9 / 800.0;

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

  async resizeEvent() {
    await this.updateBall();
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

  private async gameLoop() {
    await this.updateBall();
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

  private updateBall = async () => {
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
          const gameState = lobby.gameState.gameState;
          const winnerId = score.p1Score === SCORE_TO_WIN ? lobby.gameState.gameState.p1Id : lobby.gameState.gameState.p2Id;
          await this.playerStats.addWinToPlayer(winnerId);
          await this.playerStats.addGameToMatchHistory(gameState.p1Id, gameState.p2Name, gameState.score.p1Score, gameState.score.p2Score, false, false);
          await this.playerStats.addGameToMatchHistory(gameState.p2Id, gameState.p1Name, gameState.score.p2Score, gameState.score.p1Score, false, false);
          this.gatewayOut.emitToRoom(key, "printWinner", score.p1Score === SCORE_TO_WIN ? `${lobby.gameState.gameState.p1Name} WON!` : `${lobby.gameState.gameState.p2Name} WON!`)
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
