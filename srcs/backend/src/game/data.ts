export interface GameConfig {
  paddleHeight: number;
  paddleWidth: number;
}

export const gameConfig: GameConfig = {
  paddleHeight: 150 / 800.0,
  paddleWidth: 15 / 1200.0,
};
