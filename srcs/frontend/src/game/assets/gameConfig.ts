export interface GameConfig {
  konvaWidth: number;
  konvaHeight: number;
  paddleHeight: number;
  paddleWidth: number;
}

export const gameConfig: GameConfig = {
  konvaWidth: window.innerWidth,
  konvaHeight: window.innerWidth * 6/12,
  paddleHeight: 150,
  paddleWidth: 15,
};
