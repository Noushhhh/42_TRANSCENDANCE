import { Injectable } from '@nestjs/common';
import { gameConfig } from './data';

@Injectable()
export class GameDataService {

  // public getKonvaHeight(): number {
  //   return gameConfig.konvaHeight;
  // }

  // public getKonvaWidth(): number {
  //   return gameConfig.konvaWidth;
  // }

  // public setKonvaHeight(height: number): void {
  //   gameConfig.konvaHeight = height;
  // }

  // public setKonvaWidth(width: number): void {
  //   gameConfig.konvaWidth = width;
  // }

  // public getPaddleHeight(): number {
  //   return gameConfig.paddleHeight;
  // }

  // public getPaddleWidth(): number {
  //   return gameConfig.paddleWidth;
  // }

  // public setPaddleHeight(height: number): void {
  //   gameConfig.paddleHeight = height;
  // }

  // public setPaddleWidth(width: number): void {
  //   gameConfig.paddleWidth = width;
  // }

  // public printData() {
  //   console.log("print 1 : ", gameConfig.konvaHeight, gameConfig.konvaWidth, gameConfig.paddleHeight, gameConfig.paddleWidth);
  // }
}
