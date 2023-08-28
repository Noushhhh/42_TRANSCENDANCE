import { Vector2d } from "konva/lib/types";
import { Socket } from "socket.io-client";

export const KONVA_WIDTH = 1200;
export const KONVA_HEIGHT = 800;
export const PADDLE_HEIGHT = 150;
export const PADDLE_WIDTH = 25;

export const p1Props = {
  x: 10,
  y: 310,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  fill: "red",
  draggable: false,
};

export const p2Props = {
  x: KONVA_WIDTH - 10 - PADDLE_WIDTH,
  y: 310,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  fill: "red",
  draggable: false,
};

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
  ballState: {
    ballDirection: string,
    ballDX: number,
    ballDY: number,
    ballPos: {
      x: number;
      y: number;
    },
  },
  ballRay: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
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
