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
  setP1Score: React.Dispatch<React.SetStateAction<number>>;
  setP2Score: React.Dispatch<React.SetStateAction<number>>;
  isPaused: boolean;
  // @ts-ignore
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
}

export interface PaddleProps {
  // @ts-ignore
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  isPaused: boolean;
  p1Pos: React.MutableRefObject<Vector2d>;
  p2Pos: React.MutableRefObject<Vector2d>;
}

export interface BallProps {
  // @ts-ignore
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  isPaused: boolean;
  ballPosRef: React.MutableRefObject<Vector2d>;
  p1Pos: React.MutableRefObject<Vector2d>;
  p2Pos: React.MutableRefObject<Vector2d>;
  setP1Score: React.Dispatch<React.SetStateAction<number>>;
  setP2Score: React.Dispatch<React.SetStateAction<number>>;
}
