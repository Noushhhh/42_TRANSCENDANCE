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
  p1Pos: React.MutableRefObject<Vector2d>;
  p2Pos: React.MutableRefObject<Vector2d>;
}

export interface BallProps {
  socket: Socket;
  isPaused: boolean;
  ballPosRef: React.MutableRefObject<Vector2d>;
  p1Pos: React.MutableRefObject<Vector2d>;
  p2Pos: React.MutableRefObject<Vector2d>;
}

export interface ScoreBoardProps {
  socket: Socket;
}

export interface gameState {
  p1pos: {
    x: number;
    y: number;
  };
  p2pos: {
    x: number;
    y: number;
  };
  ballPos: {
    x: number;
    y: number;
  };
  isPaused: boolean;
  score: {
    p1Score: number;
    p2Score: number;
  };
}
