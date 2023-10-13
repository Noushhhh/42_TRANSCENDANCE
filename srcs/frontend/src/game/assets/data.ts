import { Vector2d } from "konva/lib/types";
import { Socket } from "socket.io-client";
import { gameConfig } from "./gameConfig";

// export const gameConfig.konvaWidth = 800;
// export const gameConfig.konvaHeight = 400;
// export const gameConfig.paddleHeight = 150;
// export const gameConfig.paddleWidth = 25;

export class GameConfig {
  public setKonvaWidth(size: number) {
    gameConfig.konvaWidth = size;
  }

  public setKonvaHeight(size: number) {
    gameConfig.konvaHeight = size;
  }

  public setPaddleHeight(size: number) {
    gameConfig.paddleHeight = size;
  }

  public setPaddleWidth(size: number) {
    gameConfig.paddleWidth = size;
  }

  public getKonvaWidth() {
    return gameConfig.konvaWidth;
  }

  public getKonvaHeight() {
    return gameConfig.konvaHeight;
  }

  public getPaddleWidth() {
    return gameConfig.paddleWidth;
  }

  public getPaddleHeight() {
    return gameConfig.paddleHeight;
  }
}

export interface GamePhysicsProps {
  isPaused: boolean;
  socket: Socket;
}

export interface PaddleProps {
  socket: Socket;
  isPaused: boolean;
}

export interface BallProps {
  socket: Socket;
  ballPosRef: React.MutableRefObject<Vector2d>;
}

export interface ScoreBoardProps {
  socket: Socket;
}

export interface GameState {
  p1pos: {
    x: number;
    y: number;
  };
  p2pos: {
    x: number;
    y: number;
  };
  p1Color: string,
  p2Color: string,
  p1Name: string,
  p2Name: string,
  ballState: {
    ballDirection: string,
    ballDX: number,
    ballDY: number,
    ballPos: {
      x: number;
      y: number;
    },
  },
  isPaused: boolean;
  score: {
    p1Score: number;
    p2Score: number;
  };
  isLobbyFull: boolean;
}

export interface BallState {
  ballDirection: string;
  ballDX: number;
  ballDY: number;
  ballPos: {
    x: number;
    y: number;
  },
  scoreBoard: {
    p1Score: number;
    p2Score: number;
  };
};

export interface RayProps {
  socket: Socket;
}

export interface SpectateGameProps {
  socket: Socket;
}

export interface LobbyProps {
  lobbyName: string;
  player1Id: string | undefined;
  player2Id: string | undefined;
  socket: Socket;
}
