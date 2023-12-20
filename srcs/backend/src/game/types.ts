export interface GameState {
  p1pos: {
    x: number;
    y: number;
  },
  p2pos: {
    x: number;
    y: number;
  },
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
  score: {
    p1Score: number;
    p2Score: number;
  },
}
