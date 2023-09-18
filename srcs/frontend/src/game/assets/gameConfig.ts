export interface GameConfig {
  konvaWidth: number;
  konvaHeight: number;
  paddleHeight: number;
  paddleWidth: number;
}

export const gameConfig: GameConfig = {
  konvaWidth: window.innerWidth,
  konvaHeight: window.innerHeight,
  paddleHeight: 100,
  paddleWidth: 15,
};
