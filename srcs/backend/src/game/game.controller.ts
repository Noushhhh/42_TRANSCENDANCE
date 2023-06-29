import { Controller, Get } from '@nestjs/common';
import { GameLoopService } from './gameLoop.service';

@Controller('game')
export class GameController {
  constructor(private readonly gameLoopService: GameLoopService) {}

  @Get('play')
  play() {
    this.gameLoopService.startGameLoop();
    return { msg: 'started' };
  }

  @Get('stop')
  stop() {
    this.gameLoopService.stopGameLoop();
    return { msg: 'stopped' };
  }
}
