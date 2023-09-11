export interface GameConfig {
  paddleHeight: number;
  paddleWidth: number;
}

export const gameConfig: GameConfig = {
  paddleHeight: 150 / 1200.0,
  paddleWidth: 25 / 800.0,
};

// export class GameConfig {
//   private konvaWidth = 1200;
//   private konvaHeight = 800;
//   private paddleHeight = 150;
//   private paddleWidth = 25;

//   public getKonvaHeight(): number {
//     return this.konvaHeight;
//   }

//   public getKonvaWidth(): number {
//     return this.konvaWidth;
//   }

//   public setKonvaHeight(height: number): void {
//     this.konvaHeight = height;
//   }

//   public setKonvaWidth(width: number): void {
//     this.konvaWidth = width;
//   }

//   public getPaddleHeight(): number {
//     return this.paddleHeight;
//   }

//   public getPaddleWidth(): number {
//     return this.paddleWidth;
//   }

//   public setPaddleHeight(height: number): void {
//     this.paddleHeight = height;
//   }

//   public setPaddleWidth(width: number): void {
//     this.paddleWidth = width;
//   }

//   public printData() {
//     console.log("print 1 : ", this.konvaHeight, this.konvaWidth, this.paddleHeight, this.paddleWidth);
//   }
// }
