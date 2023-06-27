export interface GameState {
  p1pos: {
    x: number;
    y: number;
  },
  p2pos: {
    x: number;
    y: number;
  },
  ballPos: {
    x: number;
    y: number;
  },
  isPaused: boolean;
  score: {
    p1Score: number;
    p2Score: number;
  },
}
